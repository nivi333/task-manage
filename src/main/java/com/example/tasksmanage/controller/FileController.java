package com.example.tasksmanage.controller;

import com.example.tasksmanage.model.Attachment;
import com.example.tasksmanage.repository.AttachmentRepository;
import com.example.tasksmanage.model.Task;
import com.example.tasksmanage.repository.TaskRepository;
import com.example.tasksmanage.model.User;
import com.example.tasksmanage.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @Autowired
    private AttachmentRepository attachmentRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private AttachmentService attachmentService;

    public FileController() {
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping("/upload")
    public Attachment uploadFile(@RequestParam("file") MultipartFile file,
                                 @RequestParam(value = "taskId", required = false) UUID taskId,
                                 @AuthenticationPrincipal User user) {
        try {
            attachmentService.validateFile(file);
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetLocation = fileStorageLocation.resolve(fileName);
            byte[] compressed = attachmentService.compress(file.getBytes());
            Files.write(targetLocation, compressed, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            Attachment attachment = new Attachment();
            attachment.setFileName(fileName);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setUrl("/api/v1/files/" + fileName);
            if (taskId != null) {
                Task task = taskRepository.findById(taskId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
                attachment.setTask(task);
            }
            attachment.setUploadedBy(user);
            return attachmentRepository.save(attachment);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload file: " + ex.getMessage());
        }
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            byte[] compressed = Files.readAllBytes(filePath);
            byte[] decompressed = attachmentService.decompress(compressed);
            Path tempPath = Files.createTempFile("decompressed-", fileName);
            Files.write(tempPath, decompressed, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            Resource resource = new UrlResource(tempPath.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
            String contentType = Files.probeContentType(tempPath);
            ResponseEntity<Resource> response = ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
            // Delete temp file after response is sent (optional: background cleanup)
            // Files.deleteIfExists(tempPath);
            return response;
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File not found: " + ex.getMessage());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading file: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{fileName}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            attachmentRepository.findAll().stream()
                .filter(a -> fileName.equals(a.getFileName()))
                .forEach(a -> attachmentRepository.delete(a));
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete file: " + ex.getMessage());
        }
    }
}
