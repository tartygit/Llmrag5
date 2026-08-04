import os
from flask import Flask
from flask_cors import CORS
from routes import rag_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register blueprints
    app.register_blueprint(rag_bp, url_prefix='/api/rag')

    @app.route('/health', methods=['GET'])
    def health():
        return {"status": "healthy"}, 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
