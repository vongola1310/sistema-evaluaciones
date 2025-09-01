import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// --- FUNCIÓN GET: Obtiene una lista de las evaluaciones mensuales ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');

    const where: any = {};

    if (employeeId) {
      where.employeeId = parseInt(employeeId, 10);
    }
    if (year) {
      where.year = parseInt(year, 10);
    }
    if (quarter) {
      where.quarter = parseInt(quarter, 10);
    }

    const evaluations = await prisma.commercialEvaluation.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNo: true,
          },
        },
      },
      orderBy: {
        evaluationDate: 'desc',
      },
    });

    return NextResponse.json(evaluations);

  } catch (error) {
    console.error("Error al cargar evaluaciones mensuales:", error);
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
        const employeeId = parseInt(body.employeeId, 10);
        const evaluationDate = new Date(body.evaluationDate);
        const quarter = parseInt(body.quarter, 10);
        const year = parseInt(body.year, 10);
        
        const salesGoalObjective = parseFloat(body.salesGoalObjective);
        const salesGoalAchieved = parseFloat(body.salesGoalAchieved);
        const activityObjective = parseFloat(body.activityObjective);
        const activityAchieved = parseFloat(body.activityAchieved);
        const creationObjective = parseFloat(body.creationObjective);
        const creationAchieved = parseFloat(body.creationAchieved);
        const conversionObjective = parseFloat(body.conversionObjective);
        const conversionAchieved = parseFloat(body.conversionAchieved);
        const crmObjective = parseFloat(body.crmObjective);
        const crmAchieved = parseFloat(body.crmAchieved);
        const extraPoints = body.extraPoints ? parseFloat(body.extraPoints) : null;

        if (isNaN(employeeId) || !evaluationDate || isNaN(quarter) || isNaN(year)) {
            return NextResponse.json({ error: 'Faltan datos generales.' }, { status: 400 });
        }

        const salesGoalPonderedScore = (salesGoalAchieved / salesGoalObjective) * PONDERACIONES.salesGoal;
        const activityPonderedScore = (activityAchieved / activityObjective) * PONDERACIONES.activity;
        const creationPonderedScore = (creationAchieved / creationObjective) * PONDERACIONES.opportunityCreation;
        const conversionPonderedScore = (conversionAchieved / conversionObjective) * PONDERACIONES.opportunityConversion;
        const crmPonderedScore = (crmAchieved / crmObjective) * PONDERACIONES.crmFollowUp;
        
        const subTotal = salesGoalPonderedScore + activityPonderedScore + creationPonderedScore + conversionPonderedScore + crmPonderedScore;
        const totalScore = subTotal + (extraPoints || 0);

        // ✅ Lógica de la nueva rúbrica de desempeño
        let rubrica = '';
        if (subTotal >= 91) {
            rubrica = 'Excelente';
        } else if (subTotal >= 81) {
            rubrica = 'Aceptable';
        } else if (subTotal >= 70) {
            rubrica = 'Necesita mejorar';
        } else if (subTotal >= 50) {
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
                rubrica, // ✅ Guardamos el resultado del desempeño
            }
        });

        return NextResponse.json(newEvaluation, { status: 201 });

    } catch (error) {
        console.error("Error al crear la evaluación mensual comercial:", error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
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
            where: {
                id: {
                    in: numericIds,
                },
            },
        });

        return NextResponse.json({ success: true, message: 'Evaluaciones eliminadas.' });

    } catch (error) {
        console.error("Error al eliminar evaluaciones mensuales:", error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}