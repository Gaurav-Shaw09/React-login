package com.example.demo.controller;

import com.example.demo.entity.Blog;
import com.example.demo.repository.BlogRepository;
import com.example.demo.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private BlogService blogService;

    private static final String UPLOAD_DIR = "uploads/";

    // Method to handle image upload
    private String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return null;
        }

        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdir();
        }

        String filePath = UPLOAD_DIR + file.getOriginalFilename();
        Path path = Paths.get(filePath);
        file.transferTo(path);

        return filePath;
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Blog>> getBlogsByUserId(@PathVariable String userId) {
        List<Blog> userBlogs = blogService.getBlogsByUserId(userId);
        return ResponseEntity.ok(userBlogs);
    }
    // 1️⃣ Upload an image separately
    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String savedPath = saveImage(file);
        return savedPath != null ? "Image uploaded: " + savedPath : "Failed to upload image!";
    }

    @PostMapping
    public ResponseEntity<?> createBlog(@RequestParam("title") String title,
                                        @RequestParam("content") String content,
                                        @RequestParam("author") String author,
                                        @RequestParam("userId") String userId,  // ✅ Accept userId
                                        @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        // ✅ Debugging
        System.out.println("Received Title: " + title);
        System.out.println("Received Content: " + content);
        System.out.println("Received Author: " + author);
        System.out.println("Received User ID: " + userId);  // ✅ Debugging userId

        if (title == null || title.trim().isEmpty() ||
                content == null || content.trim().isEmpty() ||
                author == null || author.trim().isEmpty() ||
                userId == null || userId.trim().isEmpty()) {  // ✅ Validate userId
            return ResponseEntity.badRequest().body("Title, content, author, and userId cannot be empty.");
        }

        String imagePath = file != null ? saveImage(file) : null;
        Blog blog = new Blog(title, content, author, userId, imagePath);  // ✅ Store userId

        blogRepository.save(blog);
        return ResponseEntity.ok(blog);
    }


    // 3️⃣ Get all blogs
    @GetMapping
    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    // 4️⃣ Get a blog by ID


    // 5️⃣ Update blog (Only the original author can edit)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(@PathVariable String id,
                                        @RequestParam("title") String title,
                                        @RequestParam("content") String content,
                                        @RequestParam("userId") String userId,
                                        @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        Optional<Blog> existingBlog = blogRepository.findById(id);
        if (existingBlog.isPresent()) {
            Blog updatedBlog = existingBlog.get();

            // Ensure only the original user can edit
            if (!updatedBlog.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("You are not allowed to edit this blog.");
            }

            updatedBlog.setTitle(title);
            updatedBlog.setContent(content);

            if (file != null) {
                String imagePath = saveImage(file);
                updatedBlog.setImagePath(imagePath);
            }

            return ResponseEntity.ok(blogRepository.save(updatedBlog));
        }
        return ResponseEntity.notFound().build();
    }

    // 6️⃣ Serve uploaded images
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 7️⃣ Delete a blog (Only the original author can delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable String id, @RequestParam("userId") String userId) {
        Optional<Blog> blog = blogRepository.findById(id);
        if (blog.isPresent()) {
            if (!blog.get().getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("You are not allowed to delete this blog.");
            }

            blogRepository.deleteById(id);
            return ResponseEntity.ok("Blog deleted successfully!");
        }
        return ResponseEntity.notFound().build();
    }

  



}
