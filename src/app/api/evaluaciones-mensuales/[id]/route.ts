import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// --- FUNCIÓN GET: Obtiene una lista de las evaluaciones mensuales ---
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }

    // ✅ La clave está aquí: 'include' para traer los datos relacionados
    const evaluation = await prisma.commercialEvaluation.findUnique({
      where: { id },
      include: {
        employee: true, // Incluye toda la información del empleado
        evaluator: true, // Incluye toda la información del evaluador
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluación mensual no encontrada' }, { status: 404 });
    }

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error(`Error fetching commercial evaluation ${params.id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// --- FUNCIÓN POST: Guarda una nueva evaluación mensual ---
const PONDERACIONES = {
    salesGoal: 30, activity: 20, opportunityCreation: 15,
    opportunityConversion: 20, crmFollowUp: 15,
};

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'evaluador') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const evaluatorId = session.user.id;

    try {
        const body = await request.json();

        // Función auxiliar para limpiar y convertir números de forma segura
        const cleanAndParseFloat = (value: string | number | null): number => {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                const cleanedValue = value.replace(/[\$,]/g, '');
                return parseFloat(cleanedValue) || 0;
            }
            return 0;
        };

        const employeeId = parseInt(body.employeeId, 10);
        const evaluationDate = new Date(body.evaluationDate);
        const quarter = parseInt(body.quarter, 10);
        const year = parseInt(body.year, 10);
        
        const salesGoalObjective = cleanAndParseFloat(body.salesGoalObjective);
        const salesGoalAchieved = cleanAndParseFloat(body.salesGoalAchieved);
        const activityObjective = cleanAndParseFloat(body.activityObjective);
        const activityAchieved = cleanAndParseFloat(body.activityAchieved);
        const creationObjective = cleanAndParseFloat(body.opportunityCreationObjective);
        const creationAchieved = cleanAndParseFloat(body.opportunityCreationAchieved);
        const conversionObjective = cleanAndParseFloat(body.opportunityConversionObjective);
        const conversionAchieved = cleanAndParseFloat(body.opportunityConversionAchieved);
        const crmObjective = cleanAndParseFloat(body.crmFollowUpObjective);
        const crmAchieved = cleanAndParseFloat(body.crmFollowUpAchieved);
        const extraPoints = body.extraPoints ? cleanAndParseFloat(body.extraPoints) : null;

        if (isNaN(employeeId) || !evaluationDate || isNaN(quarter) || isNaN(year)) {
            return NextResponse.json({ error: 'Faltan datos generales.' }, { status: 400 });
        }

        const calculateScore = (achieved: number, objective: number, ponderacion: number) => {
            if (objective === 0) return 0;
            if (achieved >= objective) return ponderacion;
            return (achieved / objective) * ponderacion;
        };

        const salesGoalPonderedScore = calculateScore(salesGoalAchieved, salesGoalObjective, PONDERACIONES.salesGoal);
        const activityPonderedScore = calculateScore(activityAchieved, activityObjective, PONDERACIONES.activity);
        const creationPonderedScore = calculateScore(creationAchieved, creationObjective, PONDERACIONES.opportunityCreation);
        const conversionPonderedScore = calculateScore(conversionAchieved, conversionObjective, PONDERACIONES.opportunityConversion);
        const crmPonderedScore = calculateScore(crmAchieved, crmObjective, PONDERACIONES.crmFollowUp);
        
        const subTotal = salesGoalPonderedScore + activityPonderedScore + creationPonderedScore + conversionPonderedScore + crmPonderedScore;
        const totalScore = subTotal + (extraPoints || 0);

        // ✅ Lógica de rúbrica corregida: AHORA USA EL TOTAL SCORE
        let rubrica = '';
        const scoreForRubric = totalScore;

        if (scoreForRubric >= 91) {
            rubrica = 'Excelente';
        } else if (scoreForRubric >= 81) {
            rubrica = 'Aceptable';
        } else if (scoreForRubric >= 70) {
            rubrica = 'Necesita mejorar';
        } else if (scoreForRubric >= 50) {
            rubrica = 'Bajo desempeño';
        } else {
            rubrica = 'Medidas correctivas';
        }

        const newEvaluation = await prisma.commercialEvaluation.create({
            data: {
                employeeId, evaluatorId, evaluationDate, quarter, year,
                salesGoalObjective, salesGoalAchieved,
                activityObjective, activityAchieved,
                creationObjective, creationAchieved,
                conversionObjective, conversionAchieved,
                crmObjective, crmAchieved,
                extraPoints, 
                salesGoalPonderedScore, activityPonderedScore,
                creationPonderedScore, conversionPonderedScore,
                crmPonderedScore, 
                totalScore, 
                rubrica,
            }
        });
        return NextResponse.json(newEvaluation, { status: 201 });
    } catch (error) {
        console.error("Error al crear la evaluación mensual comercial:", error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}

// --- FUNCIÓN DELETE: Elimina evaluaciones en lote ---
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'evaluador') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Se requiere una lista de IDs.' }, { status: 400 });
        }
        const numericIds = ids.map(id => parseInt(id, 10));

        await prisma.commercialEvaluation.deleteMany({
            where: { id: { in: numericIds } },
        });
        return NextResponse.json({ success: true, message: 'Evaluaciones eliminadas.' });
    } catch (error) {
        console.error("Error al eliminar evaluaciones mensuales:", error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}