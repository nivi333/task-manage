package com.example.tasksmanage.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface AttachmentService {
    void validateFile(MultipartFile file) throws IOException;
    byte[] compress(byte[] data) throws IOException;
    byte[] decompress(byte[] data) throws IOException;
    boolean isAllowedType(String contentType);
    boolean isAllowedSize(long size);
}
