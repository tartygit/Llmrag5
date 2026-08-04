import os
import time
from flask import Blueprint, request, jsonify, Response, stream_with_context
from rag_engine import RAGEngine

rag_bp = Blueprint('rag', __name__)
rag_engine = RAGEngine()

@rag_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename
    filepath = os.path.join(rag_engine.upload_dir, f"{int(time.time())}_{filename}")
    file.save(filepath)

    try:
        chunks_count = rag_engine.add_document(filename, filepath)
        return jsonify({
            "message": "File processed and indexed successfully",
            "filename": filename,
            "chunks": chunks_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/search', methods=['POST'])
def search():
    data = request.json or {}
    query = data.get("query", "")
    k = data.get("k", 3)
    if not query:
        return jsonify({"error": "No query provided"}), 400

    citations = rag_engine.search(query, k=k)
    return jsonify({"citations": citations})

@rag_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json or {}
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "No query provided"}), 400

    citations = rag_engine.search(query, k=3)

    def generate():
        for chunk in rag_engine.chat_stream(query, citations):
            yield chunk

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@rag_bp.route('/index/status', methods=['GET'])
def index_status():
    files = list(set([m.get("filename") for m in rag_engine.metadata]))
    return jsonify({
        "indexed_files": files,
        "total_chunks": len(rag_engine.metadata),
        "embedding_model": rag_engine.model_embed,
        "chat_model": rag_engine.model_chat,
        "dimension": rag_engine.dimension
    })

@rag_bp.route('/index/clear', methods=['POST'])
def clear_index():
    rag_engine.metadata = []
    rag_engine.vectors = []
    rag_engine.save_index()
    return jsonify({"message": "Index cleared successfully"})

@rag_bp.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        data = request.json or {}
        if "MODEL_CHAT" in data:
            rag_engine.model_chat = data["MODEL_CHAT"]
        if "MODEL_EMBED" in data:
            rag_engine.model_embed = data["MODEL_EMBED"]
        if "OLLAMA_HOST" in data:
            rag_engine.ollama_host = data["OLLAMA_HOST"].rstrip('/')
        return jsonify({"message": "Settings updated successfully"})

    return jsonify({
        "MODEL_CHAT": rag_engine.model_chat,
        "MODEL_EMBED": rag_engine.model_embed,
        "OLLAMA_HOST": rag_engine.ollama_host
    })
