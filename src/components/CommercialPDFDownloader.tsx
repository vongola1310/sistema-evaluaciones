'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { CommercialReportPDFDocument } from '@/components/CommercialReportPDFDocument'
import { FileDown } from 'lucide-react'
import type { FC } from 'react'

interface DownloaderProps {
    report: any;
}

const CommercialPDFDownloader: FC<DownloaderProps> = ({ report }) => {
    return (
        <PDFDownloadLink
            document={<CommercialReportPDFDocument report={report} />}
            fileName={`reporte-comercial-${report.employee.lastName}-${report.id}.pdf`}
            className="flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
            {/* Contenido estático para evitar errores de tipo */}
            <>
                <FileDown size={16}/>
                <span>Descargar PDF</span>
            </>
        </PDFDownloadLink>
    );
}

export default CommercialPDFDownloader;