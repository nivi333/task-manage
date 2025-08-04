package com.example.tasksmanage.repository;

import com.example.tasksmanage.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByTask_Id(UUID taskId);
    List<Attachment> findByComment_Id(UUID commentId);
}
