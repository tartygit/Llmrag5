package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.io.File;

@Component
public class FolderPollingService {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserService userService;

    @Scheduled(fixedDelayString = "${polling.interval.ms:5000}")
    public void pollFolder() {
        String dirPath = userService.getConfig("POLLING_DIR", "./polling_folder");
        File dir = new File(dirPath);

        if (!dir.exists()) {
            dir.mkdirs();
        }

        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isFile() && !file.getName().startsWith(".")) {
                boolean handled = false;
                for (DocumentHandler handler : documentService.getHandlers()) {
                    if (handler.canHandle(file)) {
                        try {
                            handler.handle(file, documentService);
                            // Move or delete file to avoid infinite processing
                            File processedDir = new File(dir, "processed");
                            if (!processedDir.exists()) processedDir.mkdirs();
                            File target = new File(processedDir, file.getName() + "_" + System.currentTimeMillis());
                            file.renameTo(target);
                        } catch (Exception e) {
                            System.err.println("Error processing polled file " + file.getName() + ": " + e.getMessage());
                        }
                        handled = true;
                        break;
                    }
                }
                if (!handled) {
                    System.out.println("[Polling] No registered handler for file: " + file.getName());
                }
            }
        }
    }
}
