package com.college.erp.repository;

import com.college.erp.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BookRepository extends MongoRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
}
