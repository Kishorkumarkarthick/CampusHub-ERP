package com.college.erp.repository;

import com.college.erp.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, Long> {
    List<Transaction> findByInvoiceNumber(String invoiceNumber);
}
