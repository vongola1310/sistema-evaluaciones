'use client'

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- Interfaz para los datos del reporte ---
interface CommercialReportData {
    employee: { firstName: string; lastName: string; };
    evaluationDate: string | Date;
    quarter: number;
    year: number;
    totalScore: number;
    rubrica: string;
    salesGoalObjective: number; salesGoalAchieved: number; salesGoalPonderedScore: number;
    activityObjective: number; activityAchieved: number; activityPonderedScore: number;
    creationObjective: number; creationAchieved: number; creationPonderedScore: number;
    conversionObjective: number; conversionAchieved: number; conversionPonderedScore: number;
    crmObjective: number; crmAchieved: number; crmPonderedScore: number;
    extraPoints: number | null;
}

// --- ESTILOS PARA EL PDF ---
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#1F2937', padding: 30, fontFamily: 'Helvetica', fontSize: 9, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #74C054', paddingBottom: 10, marginBottom: 20, },
  headerText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1F2937' },
  logo: { width: 120 },
  metaInfo: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 10, marginBottom: 25, fontSize: 10, },
  metaBox: { flexDirection: 'column' },
  metaLabel: { color: '#6B7280', fontSize: 9 },
  metaValue: { fontFamily: 'Helvetica-Bold' },
  table: { width: '100%', border: '1px solid #E5E7EB', borderRadius: 5, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#74C054', color: 'white', fontFamily: 'Helvetica-Bold', fontSize: 9, padding: 6, borderBottom: '1px solid #E5E7EB' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #F3F4F6', padding: 6, alignItems: 'center' },
  tableRowLast: { borderBottom: 'none' },
  colCriterio: { width: '25%', fontFamily: 'Helvetica-Bold' },
  colDescripcion: { width: '30%', color: '#6B7280', fontSize: 8 },
  colPonderacion: { width: '15%', textAlign: 'center' },
  colObjetivo: { width: '15%', textAlign: 'center' },
  colObtenido: { width: '15%', textAlign: 'center' },
  colPonderado: { width: '15%', textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 5, borderTop: '2px solid #1F2937' },
  totalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 12, paddingRight: 10 },
  totalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#74C054', width: '15%', textAlign: 'center' },
  // ✅ Nuevos estilos para el resultado final
  rubricaContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  rubricaBox: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  rubricaText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
  },
  pageNumber: { position: 'absolute', fontSize: 10, bottom: 30, left: 0, right: 0, textAlign: 'center', color: 'grey' },
});

const PONDERACIONES = { salesGoal: 30, activity: 20, opportunityCreation: 15, opportunityConversion: 20, crmFollowUp: 15 };
const camposEvaluacion = [ { key: 'updatedDate', label: 'Fecha de cierre' }, { key: 'correctPriceQty', label: 'Precios y Cantidades' }, { key: 'quoteUploaded', label: 'Cotización Cargada' }, { key: 'description', label: 'Descripción' }, { key: 'recentFollowUp', label: 'Seguimiento Reciente' }, { key: 'correctStage', label: 'Etapa Correcta' }, { key: 'realisticChance', label: 'Probabilidad Realista' }, { key: 'nextStepsDefined', label: 'Siguientes Pasos' }, { key: 'contactAssigned', label: 'Contacto Asignado' }, { key: 'commentsUpdated', label: 'Comentarios Actualizados' }, ];

// ✅ Nueva función para obtener los estilos de la rúbrica
const getRubricaStyle = (rubrica: string) => {
    switch (rubrica.toLowerCase()) {
      case 'excelente': return { backgroundColor: '#ECFDF5', borderColor: '#10B981', color: '#065F46' }; // Verde Intenso
      case 'aceptable': return { backgroundColor: '#EFF6FF', borderColor: '#60A5FA', color: '#1E40AF' }; // Azul
      case 'necesita mejorar': return { backgroundColor: '#FEF9C3', borderColor: '#FBBF24', color: '#854D0E' }; // Amarillo
      case 'bajo desempeño': return { backgroundColor: '#FFF7ED', borderColor: '#FB923C', color: '#9A3412' }; // Naranja
      case 'medidas correctivas': return { backgroundColor: '#FEF2F2', borderColor: '#F87171', color: '#991B1B' }; // Rojo Intenso
      default: return { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', color: '#4B5563' };
    }
};

// --- DOCUMENTO PDF ---
export const CommercialReportPDFDocument = ({ report }: { report: CommercialReportData }) => {
    const rubricaStyle = getRubricaStyle(report.rubrica);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
            <View style={styles.header} fixed>
                <Text style={styles.headerText}>Rúbrica de Desempeño Mensual Comercial</Text>
                <Image style={styles.logo} src="/logo.png" />
            </View>
            <View style={styles.metaInfo}>
                <View style={styles.metaBox}><Text style={styles.metaLabel}>Nombre de evaluado:</Text><Text style={styles.metaValue}>{report.employee.firstName} {report.employee.lastName}</Text></View>
                <View style={styles.metaBox}><Text style={styles.metaLabel}>Fecha de evaluación:</Text><Text style={styles.metaValue}>{new Date(report.evaluationDate).toLocaleDateString('es-MX')}</Text></View>
                <View style={styles.metaBox}><Text style={styles.metaLabel}>Trimestre evaluado:</Text><Text style={styles.metaValue}>Q{report.quarter} / {report.year}</Text></View>
            </View>
            <View style={styles.table}>
                <View style={styles.tableHeader} fixed>
                <Text style={styles.colCriterio}>Criterio</Text><Text style={styles.colDescripcion}>Descripción</Text><Text style={styles.colPonderacion}>Ponderación</Text><Text style={styles.colObjetivo}>Valor Objetivo</Text><Text style={styles.colObtenido}>Resultado Obtenido</Text><Text style={styles.colPonderado}>Resultado Ponderado</Text>
                </View>
                <View style={styles.tableRow}><Text style={styles.colCriterio}>1. Cumplimiento de Meta</Text><Text style={styles.colDescripcion}>% de cumplimiento frente a cuota</Text><Text style={styles.colPonderacion}>{PONDERACIONES.salesGoal}%</Text><Text style={styles.colObjetivo}>{(report.salesGoalObjective || 0)}%</Text><Text style={styles.colObtenido}>{(report.salesGoalAchieved || 0)}%</Text><Text style={styles.colPonderado}>{(report.salesGoalPonderedScore || 0).toFixed(2)}</Text></View>
                <View style={styles.tableRow}><Text style={styles.colCriterio}>2. Actividad Comercial</Text><Text style={styles.colDescripcion}>Número de visitas y reuniones</Text><Text style={styles.colPonderacion}>{PONDERACIONES.activity}%</Text><Text style={styles.colObjetivo}>{report.activityObjective}</Text><Text style={styles.colObtenido}>{report.activityAchieved}</Text><Text style={styles.colPonderado}>{(report.activityPonderedScore || 0).toFixed(2)}</Text></View>
                <View style={styles.tableRow}><Text style={styles.colCriterio}>3. Creación de Oportunidades</Text><Text style={styles.colDescripcion}>Valor de nuevas oportunidades</Text><Text style={styles.colPonderacion}>{PONDERACIONES.opportunityCreation}%</Text><Text style={styles.colObjetivo}>${(report.creationObjective || 0).toLocaleString('es-MX')}</Text><Text style={styles.colObtenido}>${(report.creationAchieved || 0).toLocaleString('es-MX')}</Text><Text style={styles.colPonderado}>{(report.creationPonderedScore || 0).toFixed(2)}</Text></View>
                <View style={styles.tableRow}><Text style={styles.colCriterio}>4. Conversión de Oportunidades</Text><Text style={styles.colDescripcion}>Tasa de conversión</Text><Text style={styles.colPonderacion}>{PONDERACIONES.opportunityConversion}%</Text><Text style={styles.colObjetivo}>{(report.conversionObjective || 0)}%</Text><Text style={styles.colObtenido}>{(report.conversionAchieved || 0)}%</Text><Text style={styles.colPonderado}>{(report.conversionPonderedScore || 0).toFixed(2)}</Text></View>
                <View style={styles.tableRow}><Text style={styles.colCriterio}>5. Seguimiento en CRM</Text><Text style={styles.colDescripcion}>Calidad de llenado y seguimiento</Text><Text style={styles.colPonderacion}>{PONDERACIONES.crmFollowUp}%</Text><Text style={styles.colObjetivo}>{report.crmObjective}</Text><Text style={styles.colObtenido}>{report.crmAchieved}</Text><Text style={styles.colPonderado}>{(report.crmPonderedScore || 0).toFixed(2)}</Text></View>
                {report.extraPoints != null && <View style={[styles.tableRow, styles.tableRowLast]}><Text style={styles.colCriterio}>+ Puntos Extra</Text><Text style={styles.colDescripcion}>Evidencia de compromiso, etc.</Text><Text style={styles.colPonderacion}>N/A</Text><Text style={styles.colObjetivo}>N/A</Text><Text style={styles.colObtenido}>{report.extraPoints}</Text><Text style={styles.colPonderado}>{(report.extraPoints || 0).toFixed(2)}</Text></View>}
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL DE EVALUACIÓN</Text>
                <Text style={styles.totalValue}>{(report.totalScore || 0).toFixed(2)}%</Text>
            </View>

            {/* ✅ SECCIÓN DEL RESULTADO FINAL */}
            <View style={styles.rubricaContainer}>
                <View style={[styles.rubricaBox, { backgroundColor: rubricaStyle.backgroundColor, borderColor: rubricaStyle.borderColor }]}>
                    <Text style={[styles.rubricaText, { color: rubricaStyle.color }]}>
                        {report.rubrica}
                    </Text>
                </View>
            </View>

            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
    );
};