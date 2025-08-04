package com.example.tasksmanage.service.impl;

import com.example.tasksmanage.service.AttachmentService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

@Service
public class AttachmentServiceImpl implements AttachmentService {
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/png", "image/jpeg", "application/pdf", "text/plain"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10MB

    @Override
    public void validateFile(MultipartFile file) throws IOException {
        if (!isAllowedType(file.getContentType())) {
            throw new IOException("File type not allowed");
        }
        if (!isAllowedSize(file.getSize())) {
            throw new IOException("File size exceeds limit");
        }
    }

    @Override
    public boolean isAllowedType(String contentType) {
        return contentType != null && ALLOWED_TYPES.contains(contentType);
    }

    @Override
    public boolean isAllowedSize(long size) {
        return size <= MAX_SIZE;
    }

    @Override
    public byte[] compress(byte[] data) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(bos)) {
            gzip.write(data);
        }
        return bos.toByteArray();
    }

    @Override
    public byte[] decompress(byte[] data) throws IOException {
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (GZIPInputStream gzip = new GZIPInputStream(bis)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzip.read(buffer)) > 0) {
                bos.write(buffer, 0, len);
            }
        }
        return bos.toByteArray();
    }
}
