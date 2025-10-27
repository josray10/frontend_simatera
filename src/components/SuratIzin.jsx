import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Gaya untuk surat izin
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: '40pt',
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  container: {
    border: '1pt solid #000',
    padding: '20pt',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20pt',
    borderBottom: '1pt solid #000',
    paddingBottom: '10pt',
  },
  logo: {
    width: '60pt',
    height: '60pt',
    marginRight: '15pt',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '5pt',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: '20pt',
  },
  content: {
    marginTop: '20pt',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: '8pt',
  },
  label: {
    width: '120pt',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  reason: {
    marginTop: '15pt',
    marginBottom: '15pt',
  },
  reasonLabel: {
    fontWeight: 'bold',
    marginBottom: '5pt',
  },
  reasonText: {
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  signatureSection: {
    marginTop: '40pt',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '200pt',
  },
  signatureTitle: {
    textAlign: 'center',
    marginBottom: '60pt',
  },
  signatureName: {
    textAlign: 'center',
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  date: {
    marginTop: '20pt',
    textAlign: 'right',
  },
});

// Komponen Surat Izin
const SuratIzin = ({ mahasiswa, catatan, tanggalMulai, tanggalSelesai }) => {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Kop Surat */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/images/logo.png" />
            <View style={styles.headerText}>
              <Text style={styles.title}>INSTITUT TEKNOLOGI SUMATERA</Text>
              <Text style={styles.subtitle}>ASRAMA MAHASISWA</Text>
            </View>
          </View>

          {/* Judul Surat */}
          <Text style={styles.title}>SURAT IZIN MAHASISWA</Text>

          {/* Konten */}
          <View style={styles.content}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nama</Text>
              <Text style={styles.value}>: {mahasiswa.nama}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>NIM</Text>
              <Text style={styles.value}>: {mahasiswa.nim}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Program Studi</Text>
              <Text style={styles.value}>: {mahasiswa.prodi}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Gedung/Kamar</Text>
              <Text style={styles.value}>: {mahasiswa.gedung}/{mahasiswa.noKamar}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tanggal Mulai</Text>
              <Text style={styles.value}>: {tanggalMulai}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tanggal Selesai</Text>
              <Text style={styles.value}>: {tanggalSelesai}</Text>
            </View>

            <View style={styles.reason}>
              <Text style={styles.reasonLabel}>Alasan Izin:</Text>
              <Text style={styles.reasonText}>{catatan}</Text>
            </View>
          </View>

          {/* Tanda Tangan */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Pembina Asrama</Text>
              <Text style={styles.signatureName}>{'(                                  )'}</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Mahasiswa</Text>
              <Text style={styles.signatureName}>{mahasiswa.nama}</Text>
            </View>
          </View>

          {/* Tanggal */}
          <Text style={styles.date}>Lampung Selatan, {today}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SuratIzin;
