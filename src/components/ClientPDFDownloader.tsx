'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportePDFDocument } from '@/components/ReportePDFDocument'
import { FileDown } from 'lucide-react'
import type { FC } from 'react'

// Definimos la interfaz para los datos que necesita este componente
interface DownloaderProps {
    report: any;
}

const ClientPDFDownloader: FC<DownloaderProps> = ({ report }) => {
    return (
        <PDFDownloadLink
            document={<ReportePDFDocument report={report} />}
            fileName={`reporte-semanal-${report.employee.lastName}-${report.reportId}.pdf`}
            className="flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-semibold text-xs px-3 py-1.5 rounded-md"
        >
            {/* ✅ CAMBIO: Se reemplaza la función por contenido estático */}
            <>
                <FileDown size={14}/>
                <span>Descargar PDF</span>
            </>
        </PDFDownloadLink>
    );
}

export default ClientPDFDownloader;