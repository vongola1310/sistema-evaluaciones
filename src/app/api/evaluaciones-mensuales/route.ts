import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// --- FUNCIÓN GET: Obtiene una lista de las evaluaciones mensuales ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');
    const where: any = {};

    if (employeeId) { where.employeeId = parseInt(employeeId, 10); }
    if (year) { where.year = parseInt(year, 10); }
    if (quarter) { where.quarter = parseInt(quarter, 10); }

    const evaluations = await prisma.commercialEvaluation.findMany({
      where,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeNo: true },
        },
      },
      orderBy: { evaluationDate: 'desc' },
    });
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Error al cargar evaluaciones mensuales:", error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// --- FUNCIÓN POST: Guarda una nueva evaluación mensual ---
const PONDERACIONES = {
    salesGoal: 30, 
    activity: 20, 
    opportunityCreation: 15,
    opportunityConversion: 20, 
    crmFollowUp: 15,
};

const CRITERIOS_CONFIG = {
    salesGoal: {
        name: 'Cumplimiento de Meta de Ventas',
        description: 'Porcentaje de cumplimiento frente a la cuota establecida',
        isPercentage: true,
        isCurrency: false,
        unit: '%'
    },
    activity: {
        name: 'Actividad Comercial (Presencia)',
        description: 'Número de visitas y reuniones remotas documentadas',
        isPercentage: false,
        isCurrency: false,
        unit: 'visitas'
    },
    opportunityCreation: {
        name: 'Creación de Oportunidades',
        description: 'Valor monetario de nuevas oportunidades creadas',
        isPercentage: false,
        isCurrency: true,
        unit: '$'
    },
    opportunityConversion: {
        name: 'Conversión de Oportunidades (Hit Rate)',
        description: 'Tasa de conversión de oportunidades en ventas cerradas',
        isPercentage: true,
        isCurrency: false,
        unit: '%'
    },
    crmFollowUp: {
        name: 'Seguimiento en CRM',
        description: 'Evaluación basada en la matriz de calidad de llenado del CRM',
        isPercentage: false,
        isCurrency: false,
        unit: 'puntos'
    }
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
            if (value === null || value === undefined || value === '') return 0;
            if (typeof value === 'number') return isNaN(value) ? 0 : value;
            if (typeof value === 'string') {
                const cleanedValue = value.replace(/[\$,]/g, '').trim();
                if (cleanedValue === '') return 0;
                const parsed = parseFloat(cleanedValue);
                return isNaN(parsed) ? 0 : parsed;
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
        const extraPoints = body.extraPoints ? cleanAndParseFloat(body.extraPoints) : 0;

        if (isNaN(employeeId) || !evaluationDate || isNaN(quarter) || isNaN(year)) {
            return NextResponse.json({ error: 'Faltan datos generales requeridos.' }, { status: 400 });
        }

        // Función mejorada para calcular puntajes
        const calculateScore = (achieved: number, objective: number, ponderacion: number) => {
            // Si no hay objetivo definido, retornar 0
            if (!objective || objective <= 0 || isNaN(objective)) return 0;
            
            // Si el logrado no está definido, retornar 0
            if (isNaN(achieved)) return 0;
            
            // Permitir achieved = 0 como valor válido
            // Si se cumplió o superó el objetivo, dar puntaje completo
            if (achieved >= objective) return ponderacion;
            
            // Calcular puntaje proporcional (incluso si achieved es 0)
            const percentage = achieved / objective;
            return percentage * ponderacion;
        };

        const salesGoalPonderedScore = calculateScore(salesGoalAchieved, salesGoalObjective, PONDERACIONES.salesGoal);
        const activityPonderedScore = calculateScore(activityAchieved, activityObjective, PONDERACIONES.activity);
        const creationPonderedScore = calculateScore(creationAchieved, creationObjective, PONDERACIONES.opportunityCreation);
        const conversionPonderedScore = calculateScore(conversionAchieved, conversionObjective, PONDERACIONES.opportunityConversion);
        const crmPonderedScore = calculateScore(crmAchieved, crmObjective, PONDERACIONES.crmFollowUp);
        
        const subTotal = salesGoalPonderedScore + activityPonderedScore + creationPonderedScore + conversionPonderedScore + crmPonderedScore;
        const totalScore = subTotal + extraPoints;

        // Lógica de rúbrica corregida - usar la misma lógica original
        let rubrica = '';
        let rubricaColor = '';
        const scoreForRubric = totalScore;

        if (scoreForRubric >= 91) {
            rubrica = 'Excelente';
            rubricaColor = 'text-green-700';
        } else if (scoreForRubric >= 81) {
            rubrica = 'Aceptable';
            rubricaColor = 'text-blue-600';
        } else if (scoreForRubric >= 70) {
            rubrica = 'Necesita mejorar';
            rubricaColor = 'text-yellow-600';
        } else if (scoreForRubric >= 50) {
            rubrica = 'Bajo desempeño';
            rubricaColor = 'text-orange-600';
        } else {
            rubrica = 'Medidas correctivas';
            rubricaColor = 'text-red-600';
        }

        const newEvaluation = await prisma.commercialEvaluation.create({
            data: {
                employeeId, 
                evaluatorId, 
                evaluationDate, 
                quarter, 
                year,
                salesGoalObjective: salesGoalObjective || 0, 
                salesGoalAchieved: salesGoalAchieved || 0, 
                activityObjective: activityObjective || 0, 
                activityAchieved: activityAchieved || 0,
                creationObjective: creationObjective || 0, 
                creationAchieved: creationAchieved || 0, 
                conversionObjective: conversionObjective || 0,
                conversionAchieved: conversionAchieved || 0, 
                crmObjective: crmObjective || 0, 
                crmAchieved: crmAchieved || 0,
                extraPoints: extraPoints || 0, 
                salesGoalPonderedScore: parseFloat(salesGoalPonderedScore.toFixed(2)),
                activityPonderedScore: parseFloat(activityPonderedScore.toFixed(2)),
                creationPonderedScore: parseFloat(creationPonderedScore.toFixed(2)),
                conversionPonderedScore: parseFloat(conversionPonderedScore.toFixed(2)),
                crmPonderedScore: parseFloat(crmPonderedScore.toFixed(2)), 
                totalScore: parseFloat(totalScore.toFixed(2)), 
                rubrica,
            }
        });

        // Incluir información adicional en la respuesta
        const enhancedResponse = {
            ...newEvaluation,
            rubricaColor,
            criteriosConfig: CRITERIOS_CONFIG,
            calculationDetails: {
                subTotal: parseFloat(subTotal.toFixed(2)),
                extraPointsApplied: extraPoints,
                finalScore: parseFloat(totalScore.toFixed(2)),
                breakdown: {
                    salesGoal: { 
                        score: parseFloat(salesGoalPonderedScore.toFixed(2)), 
                        percentage: salesGoalObjective > 0 ? ((salesGoalAchieved / salesGoalObjective) * 100).toFixed(1) : '0',
                        objective: salesGoalObjective,
                        achieved: salesGoalAchieved
                    },
                    activity: { 
                        score: parseFloat(activityPonderedScore.toFixed(2)), 
                        percentage: activityObjective > 0 ? ((activityAchieved / activityObjective) * 100).toFixed(1) : '0',
                        objective: activityObjective,
                        achieved: activityAchieved
                    },
                    creation: { 
                        score: parseFloat(creationPonderedScore.toFixed(2)), 
                        percentage: creationObjective > 0 ? ((creationAchieved / creationObjective) * 100).toFixed(1) : '0',
                        objective: creationObjective,
                        achieved: creationAchieved
                    },
                    conversion: { 
                        score: parseFloat(conversionPonderedScore.toFixed(2)), 
                        percentage: conversionObjective > 0 ? ((conversionAchieved / conversionObjective) * 100).toFixed(1) : '0',
                        objective: conversionObjective,
                        achieved: conversionAchieved
                    },
                    crm: { 
                        score: parseFloat(crmPonderedScore.toFixed(2)), 
                        percentage: crmObjective > 0 ? ((crmAchieved / crmObjective) * 100).toFixed(1) : '0',
                        objective: crmObjective,
                        achieved: crmAchieved
                    }
                }
            }
        };

        return NextResponse.json(enhancedResponse, { status: 201 });
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
            return NextResponse.json({ error: 'Se requiere una lista de IDs válidos.' }, { status: 400 });
        }
        const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

        if (numericIds.length === 0) {
            return NextResponse.json({ error: 'No se proporcionaron IDs válidos.' }, { status: 400 });
        }

        const result = await prisma.commercialEvaluation.deleteMany({
            where: { id: { in: numericIds } },
        });

        return NextResponse.json({ 
            success: true, 
            message: `${result.count} evaluación(es) eliminada(s) correctamente.`,
            deletedCount: result.count
        });
    } catch (error) {
        console.error("Error al eliminar evaluaciones mensuales:", error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}