package com.example.tasksmanage.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserRepositoryHolder {
    private static UserRepository userRepository;

    @Autowired
    public UserRepositoryHolder(UserRepository userRepository) {
        UserRepositoryHolder.userRepository = userRepository;
    }

    public static UserRepository get() {
        return userRepository;
    }
}
