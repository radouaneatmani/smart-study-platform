package com.smartstudy.platform.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class DocumentParserService {
    private static final Logger logger = LoggerFactory.getLogger(DocumentParserService.class);

    public String extractText(MultipartFile file) throws Exception {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "document.txt";
        }

        String lower = originalFilename.toLowerCase();
        try (InputStream inputStream = file.getInputStream()) {
            if (lower.endsWith(".pdf")) {
                return extractTextFromPdf(inputStream);
            } else if (lower.endsWith(".docx")) {
                return extractTextFromDocx(inputStream);
            } else {
                return extractTextFromTxt(inputStream);
            }
        }
    }

    private String extractTextFromPdf(InputStream inputStream) throws Exception {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return text != null ? text.trim() : "";
        }
    }

    private String extractTextFromDocx(InputStream inputStream) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(inputStream)) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph paragraph : docx.getParagraphs()) {
                String pText = paragraph.getText();
                if (pText != null && !pText.isBlank()) {
                    sb.append(pText).append("\n");
                }
            }
            return sb.toString().trim();
        }
    }

    private String extractTextFromTxt(InputStream inputStream) throws Exception {
        byte[] bytes = inputStream.readAllBytes();
        return new String(bytes, StandardCharsets.UTF_8).trim();
    }
}
