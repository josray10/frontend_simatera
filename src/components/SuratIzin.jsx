import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Gaya untuk surat izin
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 40,
  },
  container: {
    border: '1px solid #000',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'right',
    marginTop: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
  },
  signatureSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '45%',
    borderTop: '1px solid #000',
    textAlign: 'center',
    paddingTop: 10,
  },
});

// Komponen Surat Izin
const SuratIzin = ({ mahasiswa, catatan, tanggalMulai, tanggalSelesai }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.container}>
          {/* Kop Surat */}
          <View style={styles.header}>
            <Image style={styles.logo} src="logo.png" /> {/* Ganti dengan path logo yang sesuai */}
            <Text style={styles.title}>Surat Izin Mahasiswa</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Nama: {mahasiswa.nama}</Text>
            <Text style={styles.label}>NIM: {mahasiswa.nim}</Text>
            <Text style={styles.label}>Prodi: {mahasiswa.prodi}</Text>
            <Text style={styles.label}>Status: {mahasiswa.status}</Text>
            <Text style={styles.label}>Tanggal Mulai Izin: {tanggalMulai}</Text>
            <Text style={styles.label}>Tanggal Selesai Izin: {tanggalSelesai}</Text>
            <Text style={styles.label}>Alasan Izin:</Text>
            <Text>{catatan}</Text>
          </View>

          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text>Tanda Tangan Pembina Asrama</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text>Tanda Tangan Mahasiswa</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>Jakarta, {new Date().toLocaleDateString()}</Text>
            <Text>Kasra, Universitas ABC</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SuratIzin;
