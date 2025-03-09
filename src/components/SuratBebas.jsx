import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  header: {
    marginBottom: 20,
  },
  content: {
    marginBottom: 10,
  },
  studentInfo: {
    marginLeft: 20,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
  },
  value: {
    flex: 1,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  listItem: {
    marginLeft: 20,
    marginBottom: 5,
  },
  signatureContainer: {
    marginTop: 30,
    alignItems: 'flex-end',
    marginRight: 20,
  },
  signatureDate: {
    marginBottom: 50,
  },
  signatureName: {
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  signatureNIP: {
    marginTop: 5,
  }
});

// Function to format date as Indonesian format (e.g., "30 Maret 2025")
const formatTanggal = (date) => {
  return format(date, "dd MMMM yyyy", { locale: id });
};

// Main component
const SuratBebas = ({ mahasiswa, namaPembina = "Nama Pembina", nipPembina = "NIP. 123456789" }) => {
  const currentDate = new Date();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>SURAT KETERANGAN BEBAS ASRAMA</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.paragraph}>Yang bertanda tangan di bawah ini menerangkan bahwa:</Text>
        </View>
        
        {/* Student Info */}
        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>NIM</Text>
            <Text>: {mahasiswa.nim}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nama</Text>
            <Text>: {mahasiswa.nama}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Program Studi</Text>
            <Text>: {mahasiswa.prodi}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nomor Kamar</Text>
            <Text>: {mahasiswa.noKamar}</Text>
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.listItem}>
            <Text>1. Sudah menyelesaikan administrasi dan pembayaran sewa kamar selama 1 tahun</Text>
          </View>
          <View style={styles.listItem}>
            <Text>2. Telah meyelesaikan penggantian kerusakan fasilitas, sarana dan prasarana Asrama Mahasiswa ITERA.</Text>
          </View>
        </View>
        
        {/* Purpose */}
        <View style={styles.content}>
          <Text style={styles.paragraph}>Surat keterangan ini digunakan sebagai salah satu persyaratan Wisuda dan pelepasan lulusan Mahasiswa Asrama Institut Teknologi Sumatera (ITERA).</Text>
        </View>
        
        {/* Closing */}
        <View style={styles.content}>
          <Text style={styles.paragraph}>Demikian keterangan ini kami buat untuk digunakan sebagaimana mestinya.</Text>
        </View>
        
        {/* Signature */}
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureDate}>Lampung Selatan, {formatTanggal(currentDate)}</Text>
          <Text style={styles.signatureName}>{namaPembina}</Text>
          <Text style={styles.signatureNIP}>{nipPembina}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SuratBebas;