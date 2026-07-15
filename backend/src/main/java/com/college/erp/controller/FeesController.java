package com.college.erp.controller;

import com.college.erp.exception.ResourceNotFoundException;
import com.college.erp.model.Invoice;
import com.college.erp.model.Transaction;
import com.college.erp.repository.InvoiceRepository;
import com.college.erp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
@CrossOrigin
public class FeesController {

    private final InvoiceRepository invoiceRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/invoices")
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @PostMapping("/invoices")
    public Invoice createInvoice(@RequestBody Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @PostMapping("/transactions")
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @PutMapping("/invoices/{id}/collect")
    public ResponseEntity<Invoice> collectInvoice(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        invoice.setStatus("Paid");
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Record a matching transaction
        transactionRepository.save(Transaction.builder()
                .txnNumber("TXN-" + (10000 + (int)(Math.random() * 90000)))
                .invoiceNumber(invoice.getInvoiceNumber())
                .studentName(invoice.getStudentName())
                .date(new java.util.Date().toString())
                .amount(invoice.getAmount())
                .method("Credit Card")
                .status("Success")
                .build());

        return ResponseEntity.ok(savedInvoice);
    }
}
