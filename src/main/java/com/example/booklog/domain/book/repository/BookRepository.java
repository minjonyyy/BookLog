package com.example.booklog.domain.book.repository;

import com.example.booklog.domain.book.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    Optional<Book> findByGoogleBooksId(String googleBooksId);
    
    boolean existsByGoogleBooksId(String googleBooksId);
    
    @Query("SELECT b FROM Book b WHERE b.title LIKE %:keyword% OR b.authors LIKE %:keyword%")
    java.util.List<Book> findByTitleOrAuthorsContaining(String keyword);
} 