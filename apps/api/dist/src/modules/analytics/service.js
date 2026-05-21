import dayjs from "dayjs";
import { prisma } from "../../server/lib/prisma.js";
const countBy = (values) => values.reduce((accumulator, value) => {
    const key = value ?? "Unspecified";
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
}, {});
const sumBy = (items, selector) => items.reduce((total, item) => total + (selector(item) ?? 0), 0);
export const analyticsService = {
    async executive() {
        const [msmes, bdsps, products, fieldSessions] = await prisma.$transaction([
            prisma.msme.findMany({
                where: { deletedAt: null },
                include: { county: true, sector: true }
            }),
            prisma.bdsp.findMany({
                where: { deletedAt: null },
                include: { county: true }
            }),
            prisma.msmeProduct.findMany({
                where: { deletedAt: null }
            }),
            prisma.fieldCollectionSession.findMany({
                include: { county: true }
            })
        ]);
        const approvedMsmes = msmes.filter((msme) => msme.approvalStatus === "APPROVED");
        const verifiedMsmes = msmes.filter((msme) => msme.verificationStatus.toLowerCase() === "verified");
        const womenLed = msmes.filter((msme) => msme.womenLed).length;
        const youthLed = msmes.filter((msme) => msme.youthLed).length;
        const formal = msmes.filter((msme) => msme.formalityStatus.toLowerCase() === "registered").length;
        const informal = msmes.length - formal;
        const verificationBacklog = msmes.filter((msme) => ["SUBMITTED", "UNDER_REVIEW", "RETURNED_FOR_CORRECTION"].includes(msme.approvalStatus)).length;
        const monthlyRegistrationTrends = Object.entries(countBy(msmes.map((msme) => dayjs(msme.dateRegistered).format("YYYY-MM")))).map(([month, total]) => ({ month, total }));
        const financingNeedsByCounty = Object.entries(msmes.reduce((accumulator, msme) => {
            const county = msme.county.name;
            accumulator[county] = (accumulator[county] ?? 0) + msme.financingNeeds.length;
            return accumulator;
        }, {})).map(([county, total]) => ({ county, total }));
        const trainingNeedsBySector = Object.entries(msmes.reduce((accumulator, msme) => {
            const sector = msme.sector?.name ?? "Unspecified";
            accumulator[sector] = (accumulator[sector] ?? 0) + msme.trainingNeeds.length;
            return accumulator;
        }, {})).map(([sector, total]) => ({ sector, total }));
        return {
            kpis: {
                totalMsmes: msmes.length,
                totalVerifiedMsmes: verifiedMsmes.length,
                totalApprovedMsmes: approvedMsmes.length,
                totalBdsps: bdsps.length,
                womenLedMsmes: womenLed,
                youthLedMsmes: youthLed,
                formalBusinesses: formal,
                informalBusinesses: informal,
                totalEmployment: sumBy(msmes, (msme) => msme.numberOfEmployees),
                femaleEmployment: sumBy(msmes, (msme) => msme.numberOfFemaleEmployees),
                youthEmployment: sumBy(msmes, (msme) => msme.numberOfYouthEmployees),
                verificationBacklog
            },
            charts: {
                msmesByCounty: Object.entries(countBy(msmes.map((msme) => msme.county.name))).map(([county, total]) => ({ county, total })),
                msmesBySector: Object.entries(countBy(msmes.map((msme) => msme.sector?.name ?? "Unspecified"))).map(([sector, total]) => ({ sector, total })),
                msmesBySize: Object.entries(countBy(msmes.map((msme) => msme.msmeCategory))).map(([size, total]) => ({ size, total })),
                financingNeedsByCounty,
                trainingNeedsBySector,
                monthlyRegistrationTrends,
                dataCollectionProgressByCounty: fieldSessions.map((session) => ({
                    county: session.county?.name ?? "Unknown",
                    collected: session.recordsCollected,
                    pendingSync: session.pendingSyncCount,
                    synced: session.syncedCount
                })),
                bdspCoverageMap: Object.entries(countBy(bdsps.map((bdsp) => bdsp.county?.name ?? "Unknown"))).map(([county, total]) => ({ county, total })),
                productDistribution: Object.entries(countBy(products.map((product) => product.category))).map(([category, total]) => ({ category, total }))
            }
        };
    },
    async county(countyId) {
        const [county, msmes, fieldSessions, bdsps] = await prisma.$transaction([
            prisma.county.findUnique({ where: { id: countyId } }),
            prisma.msme.findMany({
                where: { countyId, deletedAt: null },
                include: { sector: true }
            }),
            prisma.fieldCollectionSession.findMany({
                where: { countyId }
            }),
            prisma.bdsp.findMany({
                where: { countyId, deletedAt: null }
            })
        ]);
        if (!county) {
            return null;
        }
        return {
            county: {
                id: county.id,
                name: county.name
            },
            kpis: {
                totalMsmes: msmes.length,
                totalBdsps: bdsps.length,
                pendingVerification: msmes.filter((msme) => msme.approvalStatus !== "APPROVED").length,
                totalCollected: sumBy(fieldSessions, (session) => session.recordsCollected)
            },
            charts: {
                sectorDistribution: Object.entries(countBy(msmes.map((msme) => msme.sector?.name ?? "Unspecified"))).map(([sector, total]) => ({ sector, total })),
                topNeeds: Object.entries(msmes.reduce((accumulator, msme) => {
                    msme.financingNeeds.forEach((need) => {
                        accumulator[need] = (accumulator[need] ?? 0) + 1;
                    });
                    return accumulator;
                }, {}))
                    .map(([need, total]) => ({ need, total }))
                    .sort((left, right) => right.total - left.total)
                    .slice(0, 5),
                fieldOfficerPerformance: Object.entries(msmes.reduce((accumulator, msme) => {
                    const key = msme.createdById ?? "Unknown";
                    accumulator[key] = (accumulator[key] ?? 0) + 1;
                    return accumulator;
                }, {})).map(([userId, total]) => ({ userId, total })),
                collectionProgress: fieldSessions.map((session) => ({
                    sessionId: session.id,
                    collected: session.recordsCollected,
                    synced: session.syncedCount,
                    rejected: session.rejectedCount
                }))
            }
        };
    },
    async dataQuality() {
        const [msmes, syncFailures] = await prisma.$transaction([
            prisma.msme.findMany({
                where: { deletedAt: null }
            }),
            prisma.offlineSyncRecord.count({
                where: { syncStatus: "FAILED" }
            })
        ]);
        const duplicateNameCandidates = Object.entries(countBy(msmes.map((msme) => msme.businessName)))
            .filter(([, total]) => total > 1)
            .map(([businessName, total]) => ({ businessName, total }));
        return {
            duplicateRecords: duplicateNameCandidates.length,
            duplicateCandidates: duplicateNameCandidates,
            missingFields: {
                missingPhone: msmes.filter((msme) => !msme.phoneNumber).length,
                missingEmail: msmes.filter((msme) => !msme.email).length,
                missingGps: msmes.filter((msme) => !msme.gpsLatitude || !msme.gpsLongitude).length
            },
            unverifiedRecords: msmes.filter((msme) => msme.verificationStatus.toLowerCase() !== "verified").length,
            pendingCorrection: msmes.filter((msme) => msme.approvalStatus === "RETURNED_FOR_CORRECTION").length,
            syncFailures,
            approvalDelays: msmes.filter((msme) => ["SUBMITTED", "UNDER_REVIEW"].includes(msme.approvalStatus) &&
                dayjs().diff(msme.dateRegistered, "day") > 7).length
        };
    },
    async partner() {
        const [msmes, reports, bdsps] = await prisma.$transaction([
            prisma.msme.findMany({
                where: { deletedAt: null, approvalStatus: "APPROVED" },
                include: { county: true, sector: true }
            }),
            prisma.report.findMany({
                where: { deletedAt: null, status: "APPROVED" },
                orderBy: { generatedAt: "desc" }
            }),
            prisma.bdsp.findMany({
                where: { deletedAt: null, approvalStatus: "APPROVED" },
                include: { county: true }
            })
        ]);
        return {
            totals: {
                approvedMsmes: msmes.length,
                approvedBdsps: bdsps.length,
                downloadableReports: reports.length
            },
            countyInsights: Object.entries(countBy(msmes.map((msme) => msme.county.name))).map(([county, total]) => ({ county, total })),
            sectorInsights: Object.entries(countBy(msmes.map((msme) => msme.sector?.name ?? "Unspecified"))).map(([sector, total]) => ({ sector, total })),
            reports: reports.map((report) => ({
                id: report.id,
                title: report.title,
                type: report.type,
                reportingPeriod: report.reportingPeriod,
                generatedAt: report.generatedAt
            }))
        };
    }
};
