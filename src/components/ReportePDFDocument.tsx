'use client'

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- Interfaz para los datos del reporte ---
interface ReportData {
  employee: { firstName: string; lastName: string; };
  startDate: string | Date;
  endDate: string | Date;
  evaluations: {
    id: number;
    opportunity: { number: string; name: string; };
    scoreRaw: number;
    possibleScore: number;
    [key: string]: any; // Para permitir acceso a campos dinámicos
  }[];
  averageScore: number;
  rubrica: string;
}

// --- ESTILOS PARA EL PDF (ACTUALIZADOS A LIGHT MODE) ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF', // Fondo blanco
    color: '#1F2937', // Texto oscuro principal
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#74C054', // Verde corporativo
  },
  subtitle: {
    fontSize: 12,
    color: '#4B5563', // Gris oscuro para subtítulos
  },
  summarySection: {
    backgroundColor: '#F9FAFB', // Gris muy claro (como brand-card)
    border: '1px solid #E5E7EB', // Borde sutil
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  kpiBox: {
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 9,
    color: '#6B7280', // Gris medio
    marginTop: 2,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937', // Texto oscuro
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#111827', // Texto negro
    marginBottom: 10,
    borderBottom: '1px solid #74C054', // Línea verde corporativo
    paddingBottom: 5,
  },
  evaluationCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  opportunityName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    width: '75%',
  },
  score: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#74C054',
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #F3F4F6', // Borde muy sutil
    paddingVertical: 5,
    alignItems: 'center'
  },
  tableColLabel: {
    width: '55%',
    paddingRight: 5,
    color: '#4B5563',
  },
  tableColScore: {
    width: '20%',
    fontFamily: 'Helvetica-Bold',
  },
  tableColComment: {
    width: '25%',
    fontStyle: 'italic',
    color: '#6B7280',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

const camposEvaluacion = [ { key: 'updatedDate', label: 'Fecha de cierre' }, { key: 'correctPriceQty', label: 'Precios y Cantidades' }, { key: 'quoteUploaded', label: 'Cotización Cargada' }, { key: 'description', label: 'Descripción' }, { key: 'recentFollowUp', label: 'Seguimiento Reciente' }, { key: 'correctStage', label: 'Etapa Correcta' }, { key: 'realisticChance', label: 'Probabilidad Realista' }, { key: 'nextStepsDefined', label: 'Siguientes Pasos' }, { key: 'contactAssigned', label: 'Contacto Asignado' }, { key: 'commentsUpdated', label: 'Comentarios Actualizados' }, ];

const ScoreIndicatorPDF = ({ score }: { score: string }) => {
    switch (score) {
        case '2':
            return <Text style={{ ...styles.tableColScore, color: '#16A34A' }}>✓ Cumplido</Text>;
        case '1':
            return <Text style={{ ...styles.tableColScore, color: '#D97706' }}>- Parcial</Text>;
        case '0':
            return <Text style={{ ...styles.tableColScore, color: '#DC2626' }}>✗ Incumplido</Text>;
        case 'N/A':
            return <Text style={{ ...styles.tableColScore, color: '#6B7280' }}>N/A</Text>;
        default:
            return <Text style={styles.tableColScore}>-</Text>;
    }
};

// --- DOCUMENTO PDF ---
export const ReportePDFDocument = ({ report }: { report: ReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Reporte de Rendimiento Semanal</Text>
        <Text style={styles.subtitle}>{report.employee.firstName} {report.employee.lastName}</Text>
      </View>

      <View style={styles.summarySection}>
        <Text style={{ textAlign: 'center', fontSize: 14, color: '#1F2937', fontFamily: 'Helvetica-Bold' }}>Resumen del Período</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{`${new Date(report.startDate).toLocaleDateString('es-MX')} - ${new Date(report.endDate).toLocaleDateString('es-MX')}`}</Text><Text style={styles.kpiLabel}>Período</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{report.evaluations.length}</Text><Text style={styles.kpiLabel}>Ops. Evaluadas</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{report.averageScore.toFixed(1)} / 20</Text><Text style={styles.kpiLabel}>Promedio</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{report.rubrica}</Text><Text style={styles.kpiLabel}>Rúbrica</Text></View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Desglose de Evaluaciones</Text>
      
      {report.evaluations.map(ev => (
        <View key={ev.id} style={styles.evaluationCard} wrap={false}>
          <View style={styles.opportunityHeader}>
            <Text style={styles.opportunityName}>{ev.opportunity.number} - {ev.opportunity.name}</Text>
            <Text style={styles.score}>Puntaje: {ev.scoreRaw} / {ev.possibleScore}</Text>
          </View>
          <View style={styles.table}>
            {camposEvaluacion.map(campo => {
              const value = ev[campo.key];
              const comment = ev[`${campo.key}Comment`];
              return (
                <View key={campo.key} style={styles.tableRow}>
                  <Text style={styles.tableColLabel}>{campo.label}:</Text>
                  <ScoreIndicatorPDF score={value} />
                  <Text style={styles.tableColComment}>{comment || '-'}</Text>
                </View>
              )
            })}
          </View>
        </View>
      ))}

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  </Document>
);