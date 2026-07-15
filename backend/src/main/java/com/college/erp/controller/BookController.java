package com.college.erp.controller;

import com.college.erp.exception.ResourceNotFoundException;
import com.college.erp.model.Book;
import com.college.erp.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin
public class BookController {

    private final BookRepository bookRepository;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return ResponseEntity.ok(book);
    }

    @PostMapping
    public Book createBook(@RequestBody Book book) {
        book.setStatus("Available");
        return bookRepository.save(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book details) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        book.setIsbn(details.getIsbn());
        book.setTitle(details.getTitle());
        book.setAuthor(details.getAuthor());
        book.setCategory(details.getCategory());

        return ResponseEntity.ok(bookRepository.save(book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(book);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/borrow")
    public ResponseEntity<Book> borrowBook(
            @PathVariable Long id,
            @RequestParam String studentName,
            @RequestParam String dueDate
    ) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        book.setStatus("Borrowed");
        book.setBorrowedBy(studentName);
        book.setDueDate(dueDate);

        return ResponseEntity.ok(bookRepository.save(book));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Book> returnBook(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        book.setStatus("Available");
        book.setBorrowedBy(null);
        book.setDueDate(null);

        return ResponseEntity.ok(bookRepository.save(book));
    }
}
