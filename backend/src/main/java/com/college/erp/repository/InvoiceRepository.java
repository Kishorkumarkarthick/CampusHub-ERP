package com.college.erp.repository;

import com.college.erp.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface InvoiceRepository extends MongoRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
