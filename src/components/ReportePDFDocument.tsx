// /src/components/ReportePDFDocument.tsx

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- ✅ PASO 1: Definimos la interfaz para los datos del reporte ---
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

// --- ESTILOS PARA EL PDF (sin cambios) ---
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#111827', color: '#D1D5DB', padding: 30, fontFamily: 'Helvetica', fontSize: 10, },
  header: { textAlign: 'center', marginBottom: 20, },
  title: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Helvetica-Bold', color: '#34D399', },
  subtitle: { fontSize: 12, color: '#9CA3AF', },
  summarySection: { backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: 8, padding: 15, marginBottom: 20, },
  kpiGrid: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, },
  kpiBox: { alignItems: 'center', },
  kpiLabel: { fontSize: 9, color: '#9CA3AF', marginTop: 2, },
  kpiValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: 'white', },
  sectionTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: 'white', marginBottom: 10, borderBottom: '1px solid #34D399', paddingBottom: 5, },
  evaluationCard: { backgroundColor: '#1F2937', borderRadius: 6, padding: 10, marginBottom: 10, },
  opportunityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, },
  opportunityName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: 'white', width: '75%', },
  score: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#34D399', },
  table: { width: '100%', },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #374151', paddingVertical: 4, },
  tableColLabel: { width: '55%', paddingRight: 5, },
  tableColScore: { width: '15%', textAlign: 'center', fontFamily: 'Helvetica-Bold', },
  tableColComment: { width: '30%', fontStyle: 'italic', color: '#9CA3AF', },
  pageNumber: { position: 'absolute', fontSize: 10, bottom: 30, left: 0, right: 0, textAlign: 'center', color: 'grey', },
});

const camposEvaluacion = [ { key: 'updatedDate', label: 'Fecha de cierre' }, { key: 'correctPriceQty', label: 'Precios y Cantidades' }, { key: 'quoteUploaded', label: 'Cotización Cargada' }, { key: 'description', label: 'Descripción' }, { key: 'recentFollowUp', label: 'Seguimiento Reciente' }, { key: 'correctStage', label: 'Etapa Correcta' }, { key: 'realisticChance', label: 'Probabilidad Realista' }, { key: 'nextStepsDefined', label: 'Siguientes Pasos' }, { key: 'contactAssigned', label: 'Contacto Asignado' }, { key: 'commentsUpdated', label: 'Comentarios Actualizados' }, ];

// --- DOCUMENTO PDF ---
// ✅ PASO 2: Aplicamos el tipo a la prop 'report'
export const ReportePDFDocument = ({ report }: { report: ReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Reporte de Rendimiento Semanal</Text>
        <Text style={styles.subtitle}>{report.employee.firstName} {report.employee.lastName}</Text>
      </View>

      <View style={styles.summarySection}>
        <Text style={{ textAlign: 'center', fontSize: 14, color: 'white', fontFamily: 'Helvetica-Bold' }}>Resumen del Período</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{`${new Date(report.startDate).toLocaleDateString('es-MX')} - ${new Date(report.endDate).toLocaleDateString('es-MX')}`}</Text><Text style={styles.kpiLabel}>Período</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{report.evaluations.length}</Text><Text style={styles.kpiLabel}>Ops. Evaluadas</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{report.averageScore.toFixed(1)} / 20</Text><Text style={styles.kpiLabel}>Promedio</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiValue}>{report.rubrica}</Text><Text style={styles.kpiLabel}>Rúbrica</Text></View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Desglose de Evaluaciones</Text>
      
      {/* TypeScript ahora sabe que 'ev' es un objeto de la lista 'evaluations' */}
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
                  <Text style={styles.tableColScore}>{value}</Text>
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