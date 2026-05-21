import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hash } from "@node-rs/argon2";
import { PrismaClient, WorkflowStatus, DataSource, OpportunityStatus, OpportunityType, ReportType, ReportFormat, AuditAction } from "@prisma/client";
const seedFilePath = fileURLToPath(import.meta.url);
const seedDirectory = path.dirname(seedFilePath);
const envCandidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(seedDirectory, "../../../.env")
];
for (const envPath of envCandidates) {
    if (!fs.existsSync(envPath)) {
        continue;
    }
    const envContents = fs.readFileSync(envPath, "utf8");
    for (const rawLine of envContents.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }
        const key = line.slice(0, separatorIndex).trim();
        const value = line
            .slice(separatorIndex + 1)
            .trim()
            .replace(/^"(.*)"$/, "$1");
        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
    if (process.env.DATABASE_URL) {
        break;
    }
}
const prisma = new PrismaClient();
const permissions = [
    { key: "dashboard:view", name: "View dashboards", module: "dashboard" },
    { key: "analytics:view", name: "View analytics", module: "analytics" },
    { key: "users:view", name: "View users", module: "users" },
    { key: "users:create", name: "Create users", module: "users" },
    { key: "users:update", name: "Update users", module: "users" },
    { key: "users:delete", name: "Delete users", module: "users" },
    { key: "roles:view", name: "View roles", module: "roles" },
    { key: "roles:update", name: "Update roles", module: "roles" },
    { key: "msmes:view", name: "View MSMEs", module: "msmes" },
    { key: "msmes:create", name: "Create MSMEs", module: "msmes" },
    { key: "msmes:update", name: "Update MSMEs", module: "msmes" },
    { key: "msmes:delete", name: "Delete MSMEs", module: "msmes" },
    { key: "msmes:approve", name: "Approve MSMEs", module: "msmes" },
    { key: "msmes:verify", name: "Verify MSMEs", module: "msmes" },
    { key: "bdsps:view", name: "View BDSPs", module: "bdsps" },
    { key: "bdsps:create", name: "Create BDSPs", module: "bdsps" },
    { key: "bdsps:update", name: "Update BDSPs", module: "bdsps" },
    { key: "bdsps:delete", name: "Delete BDSPs", module: "bdsps" },
    { key: "bdsps:approve", name: "Approve BDSPs", module: "bdsps" },
    { key: "bdsps:verify", name: "Verify BDSPs", module: "bdsps" },
    { key: "products:view", name: "View products", module: "products" },
    { key: "products:create", name: "Create products", module: "products" },
    { key: "products:update", name: "Update products", module: "products" },
    { key: "products:approve", name: "Approve products", module: "products" },
    { key: "opportunities:view", name: "View opportunities", module: "opportunities" },
    { key: "opportunities:create", name: "Create opportunities", module: "opportunities" },
    { key: "opportunities:update", name: "Update opportunities", module: "opportunities" },
    { key: "reports:view", name: "View reports", module: "reports" },
    { key: "reports:generate", name: "Generate reports", module: "reports" },
    { key: "imports:run", name: "Run imports", module: "imports" },
    { key: "exports:run", name: "Run exports", module: "exports" },
    { key: "files:upload", name: "Upload files", module: "files" },
    { key: "files:view", name: "View files", module: "files" },
    { key: "audit:view", name: "View audit logs", module: "audit" },
    { key: "settings:view", name: "View settings", module: "settings" },
    { key: "settings:update", name: "Update settings", module: "settings" },
    { key: "notifications:view", name: "View notifications", module: "notifications" }
];
const roleMap = {
    SUPER_ADMIN: permissions.map((permission) => permission.key),
    SBA_ADMIN: [
        "dashboard:view",
        "analytics:view",
        "users:view",
        "users:create",
        "users:update",
        "roles:view",
        "msmes:view",
        "msmes:create",
        "msmes:update",
        "msmes:approve",
        "msmes:verify",
        "bdsps:view",
        "bdsps:create",
        "bdsps:update",
        "bdsps:approve",
        "bdsps:verify",
        "products:view",
        "products:create",
        "products:update",
        "products:approve",
        "opportunities:view",
        "opportunities:create",
        "opportunities:update",
        "reports:view",
        "reports:generate",
        "imports:run",
        "exports:run",
        "files:upload",
        "files:view",
        "audit:view",
        "settings:view",
        "settings:update",
        "notifications:view"
    ],
    COUNTY_SUPERVISOR: [
        "dashboard:view",
        "analytics:view",
        "msmes:view",
        "msmes:update",
        "msmes:verify",
        "bdsps:view",
        "bdsps:update",
        "bdsps:verify",
        "reports:view",
        "files:view",
        "notifications:view"
    ],
    DATA_ENTRY_OFFICER: [
        "dashboard:view",
        "msmes:view",
        "msmes:create",
        "msmes:update",
        "bdsps:view",
        "bdsps:create",
        "bdsps:update",
        "products:view",
        "products:create",
        "products:update",
        "files:upload",
        "files:view",
        "notifications:view"
    ],
    INSPECTOR: ["dashboard:view", "msmes:view", "msmes:verify", "bdsps:view", "bdsps:verify", "files:upload", "files:view", "notifications:view"],
    DATA_ANALYST: ["dashboard:view", "analytics:view", "msmes:view", "bdsps:view", "products:view", "opportunities:view", "reports:view", "reports:generate", "exports:run", "files:view", "notifications:view"],
    DEVELOPMENT_PARTNER_VIEWER: ["dashboard:view", "analytics:view", "msmes:view", "bdsps:view", "products:view", "reports:view", "files:view", "notifications:view"],
    FINANCIAL_INSTITUTION_VIEWER: ["dashboard:view", "analytics:view", "msmes:view", "products:view", "opportunities:view", "reports:view", "files:view", "notifications:view"],
    MSME_OWNER: ["dashboard:view", "msmes:view", "msmes:update", "products:view", "products:create", "products:update", "opportunities:view", "files:upload", "files:view", "notifications:view"],
    AUDITOR: ["dashboard:view", "audit:view", "reports:view", "files:view", "notifications:view"]
};
const roles = [
    { key: "SUPER_ADMIN", name: "Super Admin", description: "Full system control", isSystemDefault: true },
    { key: "SBA_ADMIN", name: "SBA Admin", description: "Manages national platform data", isSystemDefault: true },
    { key: "COUNTY_SUPERVISOR", name: "County Supervisor", description: "County validation and oversight", isSystemDefault: true },
    { key: "DATA_ENTRY_OFFICER", name: "Data Entry Officer", description: "Field registration and updates", isSystemDefault: true },
    { key: "INSPECTOR", name: "Inspector / Verification Officer", description: "Verification and field inspection", isSystemDefault: true },
    { key: "DATA_ANALYST", name: "Data Analyst", description: "Analytics and reporting access", isSystemDefault: true },
    { key: "DEVELOPMENT_PARTNER_VIEWER", name: "Development Partner Viewer", description: "Read-only partner analytics", isSystemDefault: true },
    { key: "FINANCIAL_INSTITUTION_VIEWER", name: "Financial Institution Viewer", description: "Verified financing-ready MSMEs", isSystemDefault: true },
    { key: "MSME_OWNER", name: "MSME Owner", description: "Self-service business owner access", isSystemDefault: true },
    { key: "AUDITOR", name: "Auditor", description: "Audit and compliance read-only access", isSystemDefault: true }
];
const counties = [
    "Bomi",
    "Bong",
    "Gbarpolu",
    "Grand Bassa",
    "Grand Cape Mount",
    "Grand Gedeh",
    "Grand Kru",
    "Lofa",
    "Margibi",
    "Maryland",
    "Montserrado",
    "Nimba",
    "River Cess",
    "River Gee",
    "Sinoe"
];
const districtMap = {
    Bomi: ["Klay", "Senjeh", "Dewoin"],
    Bong: ["Gbarnga", "Suakoko", "Salala"],
    Gbarpolu: ["Bopolu", "Kongba", "Bokomu"],
    "Grand Bassa": ["Buchanan", "Owensgrove", "District 3"],
    "Grand Cape Mount": ["Robertsport", "Tewor", "Garwula"],
    "Grand Gedeh": ["Zwedru", "Konobo", "Tchien"],
    "Grand Kru": ["Barclayville", "Buah", "Sasstown"],
    Lofa: ["Voinjama", "Salayea", "Foya"],
    Margibi: ["Kakata", "Harbel", "Gibi"],
    Maryland: ["Harper", "Pleebo", "Karluway"],
    Montserrado: ["Greater Monrovia", "Careysburg", "Todee"],
    Nimba: ["Sanniquellie", "Ganta", "Tappita"],
    "River Cess": ["Cestos", "Yarpah", "Juarzon"],
    "River Gee": ["Fish Town", "Sarbo", "Tuobo"],
    Sinoe: ["Greenville", "Jaedae", "Buto"]
};
const sectors = [
    { code: "AGRIC", name: "Agriculture", subsectors: ["Crop Production", "Agro Processing", "Livestock"] },
    { code: "MANUF", name: "Manufacturing", subsectors: ["Light Manufacturing", "Food Processing", "Furniture"] },
    { code: "TRADE", name: "Trade", subsectors: ["Retail", "Wholesale", "Import Distribution"] },
    { code: "SERV", name: "Services", subsectors: ["Professional Services", "Cleaning", "Repair"] },
    { code: "ICT", name: "ICT", subsectors: ["Software", "Digital Services", "Device Repair"] },
    { code: "TRANS", name: "Transport", subsectors: ["Logistics", "Passenger Transport", "Fleet Support"] },
    { code: "CONST", name: "Construction", subsectors: ["Building Works", "Electrical", "Plumbing"] },
    { code: "CREAT", name: "Creative Industry", subsectors: ["Fashion", "Media", "Crafts"] },
    { code: "HOSP", name: "Hospitality", subsectors: ["Restaurants", "Guesthouses", "Catering"] },
    { code: "MINE", name: "Mining Support", subsectors: ["Equipment Support", "Camp Services", "Safety Services"] },
    { code: "FISH", name: "Fisheries", subsectors: ["Fishing", "Cold Chain", "Fish Processing"] },
    { code: "OTHER", name: "Other", subsectors: ["General", "Cross-Sector", "Emerging"] }
];
const lookupItems = [
    ["business_type", "SOLE", "Sole Proprietorship"],
    ["business_type", "PARTNER", "Partnership"],
    ["business_type", "CORP", "Corporation"],
    ["business_type", "COOP", "Cooperative"],
    ["business_type", "ASSOC", "Association"],
    ["business_type", "INFORMAL", "Informal Enterprise"],
    ["msme_size", "MICRO", "Micro"],
    ["msme_size", "SMALL", "Small"],
    ["msme_size", "MEDIUM", "Medium"],
    ["ownership_structure", "FAMILY", "Family-Owned"],
    ["ownership_structure", "INDIVIDUAL", "Individual-Owned"],
    ["ownership_structure", "PARTNERSHIP", "Partnership-Owned"],
    ["ownership_structure", "COOPERATIVE", "Cooperative-Owned"],
    ["training_need", "BOOKKEEPING", "Bookkeeping & Records"],
    ["training_need", "DIGITAL", "Digital Skills"],
    ["training_need", "MARKETING", "Marketing & Branding"],
    ["financing_need", "WORKING_CAPITAL", "Working Capital"],
    ["financing_need", "EQUIPMENT", "Equipment Purchase"],
    ["financing_need", "EXPANSION", "Business Expansion"],
    ["product_category", "FOOD", "Food Products"],
    ["product_category", "TEXTILE", "Textile & Fashion"],
    ["product_category", "DIGITAL", "Digital Services"],
    ["bdsp_service_category", "TRAINING", "Training"],
    ["bdsp_service_category", "ADVISORY", "Advisory"],
    ["bdsp_service_category", "FINANCE", "Financial Services"],
    ["bdsp_service_category", "MARKET", "Market Linkage"],
    ["report_template", "NATIONAL", "National Inventory Template"],
    ["report_template", "COUNTY", "County Profile Template"]
];
const users = [
    { email: "admin@sba.gov.lr", fullName: "System Super Admin", roleKey: "SUPER_ADMIN", county: "Montserrado" },
    { email: "sba.admin@sba.gov.lr", fullName: "SBA National Admin", roleKey: "SBA_ADMIN", county: "Montserrado" },
    { email: "supervisor@sba.gov.lr", fullName: "Bong County Supervisor", roleKey: "COUNTY_SUPERVISOR", county: "Bong" },
    { email: "data.officer@sba.gov.lr", fullName: "National Data Entry Officer", roleKey: "DATA_ENTRY_OFFICER", county: "Montserrado" },
    { email: "analyst@sba.gov.lr", fullName: "SBA Data Analyst", roleKey: "DATA_ANALYST", county: "Montserrado" },
    { email: "partner@sba.gov.lr", fullName: "Development Partner Viewer", roleKey: "DEVELOPMENT_PARTNER_VIEWER", county: "Montserrado" },
    { email: "finance.viewer@sba.gov.lr", fullName: "Financial Institution Viewer", roleKey: "FINANCIAL_INSTITUTION_VIEWER", county: "Montserrado" },
    { email: "owner@sba.gov.lr", fullName: "Sample MSME Owner", roleKey: "MSME_OWNER", county: "Margibi" },
    { email: "inspector@sba.gov.lr", fullName: "Field Verification Officer", roleKey: "INSPECTOR", county: "Nimba" },
    { email: "auditor@sba.gov.lr", fullName: "Internal Auditor", roleKey: "AUDITOR", county: "Montserrado" }
];
const msmeSeeds = [
    {
        businessName: "Bong Fresh Cassava Foods",
        businessType: "Cooperative",
        msmeCategory: "Small",
        formalityStatus: "Registered",
        sector: "Agriculture",
        subsector: "Agro Processing",
        county: "Bong",
        district: "Gbarnga",
        cityTownCommunity: "Gbarnga",
        physicalAddress: "Main market road, Gbarnga",
        contactPerson: "Massa V. Kollie",
        phoneNumber: "+231770000101",
        ownerName: "Massa V. Kollie",
        ownerGender: "FEMALE",
        ownerAge: 31,
        youthLed: true,
        womenLed: true,
        numberOfEmployees: 18,
        numberOfFemaleEmployees: 11,
        numberOfYouthEmployees: 9,
        annualRevenueRange: "USD 25,000 - 50,000",
        businessStage: "Growth",
        financingNeeds: ["Equipment Purchase", "Working Capital"],
        trainingNeeds: ["Marketing & Branding"],
        productsServicesOffered: "Processed cassava flour, gari, packaged fufu",
        verificationStatus: "Verified",
        approvalStatus: WorkflowStatus.APPROVED,
        optedInForFinancing: true
    },
    {
        businessName: "Montserrado Digital Works",
        businessType: "Corporation",
        msmeCategory: "Medium",
        formalityStatus: "Registered",
        sector: "ICT",
        subsector: "Software",
        county: "Montserrado",
        district: "Greater Monrovia",
        cityTownCommunity: "Sinkor",
        physicalAddress: "Tubman Boulevard, Sinkor",
        contactPerson: "Emmanuel S. Toweh",
        phoneNumber: "+231770000102",
        ownerName: "Emmanuel S. Toweh",
        ownerGender: "MALE",
        ownerAge: 29,
        youthLed: true,
        womenLed: false,
        numberOfEmployees: 34,
        numberOfFemaleEmployees: 14,
        numberOfYouthEmployees: 26,
        annualRevenueRange: "USD 75,000 - 150,000",
        businessStage: "Growth",
        financingNeeds: ["Business Expansion"],
        trainingNeeds: ["Bookkeeping & Records"],
        productsServicesOffered: "Software development, website design, digital transformation support",
        verificationStatus: "Under Review",
        approvalStatus: WorkflowStatus.UNDER_REVIEW,
        optedInForFinancing: true
    },
    {
        businessName: "Nimba Metal Fabricators",
        businessType: "Partnership",
        msmeCategory: "Small",
        formalityStatus: "Pending Registration",
        sector: "Manufacturing",
        subsector: "Furniture",
        county: "Nimba",
        district: "Ganta",
        cityTownCommunity: "Ganta",
        physicalAddress: "Industrial quarter, Ganta",
        contactPerson: "Kumeh G. Zogar",
        phoneNumber: "+231770000103",
        ownerName: "Kumeh G. Zogar",
        ownerGender: "MALE",
        ownerAge: 37,
        youthLed: false,
        womenLed: false,
        numberOfEmployees: 14,
        numberOfFemaleEmployees: 2,
        numberOfYouthEmployees: 7,
        annualRevenueRange: "USD 10,000 - 25,000",
        businessStage: "Early Growth",
        financingNeeds: ["Equipment Purchase"],
        trainingNeeds: ["Digital Skills"],
        productsServicesOffered: "Metal doors, window frames, fabrication works",
        verificationStatus: "Pending",
        approvalStatus: WorkflowStatus.SUBMITTED,
        optedInForFinancing: false
    },
    {
        businessName: "Grand Bassa Coastal Fisheries Group",
        businessType: "Cooperative",
        msmeCategory: "Micro",
        formalityStatus: "Unregistered",
        sector: "Fisheries",
        subsector: "Fishing",
        county: "Grand Bassa",
        district: "Buchanan",
        cityTownCommunity: "Buchanan",
        physicalAddress: "Fishing community, Buchanan",
        contactPerson: "Fatu Wilson",
        phoneNumber: "+231770000104",
        ownerName: "Fatu Wilson",
        ownerGender: "FEMALE",
        ownerAge: 42,
        youthLed: false,
        womenLed: true,
        numberOfEmployees: 8,
        numberOfFemaleEmployees: 5,
        numberOfYouthEmployees: 4,
        annualRevenueRange: "Below USD 10,000",
        businessStage: "Startup",
        financingNeeds: ["Cold Storage"],
        trainingNeeds: ["Bookkeeping & Records", "Marketing & Branding"],
        productsServicesOffered: "Fresh fish, smoked fish",
        verificationStatus: "Verified",
        approvalStatus: WorkflowStatus.APPROVED,
        optedInForFinancing: true
    },
    {
        businessName: "Lofa Green Growers",
        businessType: "Association",
        msmeCategory: "Small",
        formalityStatus: "Registered",
        sector: "Agriculture",
        subsector: "Crop Production",
        county: "Lofa",
        district: "Voinjama",
        cityTownCommunity: "Voinjama",
        physicalAddress: "Agric belt, Voinjama",
        contactPerson: "Abu Kamara",
        phoneNumber: "+231770000105",
        ownerName: "Abu Kamara",
        ownerGender: "MALE",
        ownerAge: 28,
        youthLed: true,
        womenLed: false,
        numberOfEmployees: 20,
        numberOfFemaleEmployees: 6,
        numberOfYouthEmployees: 13,
        annualRevenueRange: "USD 25,000 - 50,000",
        businessStage: "Growth",
        financingNeeds: ["Working Capital"],
        trainingNeeds: ["Marketing & Branding"],
        productsServicesOffered: "Rice and vegetable production",
        verificationStatus: "Verified",
        approvalStatus: WorkflowStatus.APPROVED,
        optedInForFinancing: true
    }
];
const bdspSeeds = [
    {
        providerName: "Liberia Enterprise Support Hub",
        providerType: "Incubator",
        registrationStatus: "Registered",
        areaOfExpertise: ["Youth Entrepreneurship", "Startup Advisory"],
        servicesOffered: ["Training", "Business Coaching", "Market Linkage"],
        contactPerson: "Grace Menjor",
        phoneNumber: "+231880000201",
        email: "contact@lesh.lr",
        website: "https://lesh.example.org",
        county: "Montserrado",
        district: "Greater Monrovia",
        sector: "Services",
        subsector: "Professional Services",
        yearsOfExperience: 8,
        targetBeneficiaries: ["Youth-led MSMEs", "Women-led MSMEs"],
        staffCapacity: 14,
        certifications: ["National NGO Registration", "AfDB Project Experience"],
        servicePricingModel: "Mixed grant-supported and fee-for-service",
        availabilityStatus: "Available",
        verificationStatus: "Verified",
        approvalStatus: WorkflowStatus.APPROVED
    },
    {
        providerName: "Bong Business Advisory Center",
        providerType: "Training Institution",
        registrationStatus: "Registered",
        areaOfExpertise: ["Bookkeeping", "Agribusiness Training"],
        servicesOffered: ["Training", "Advisory"],
        contactPerson: "Hawa Fofana",
        phoneNumber: "+231880000202",
        email: "info@bbac.lr",
        county: "Bong",
        district: "Gbarnga",
        sector: "Agriculture",
        subsector: "Agro Processing",
        yearsOfExperience: 5,
        targetBeneficiaries: ["Agriculture MSMEs"],
        staffCapacity: 9,
        certifications: ["TVET Accreditation"],
        servicePricingModel: "Fee-for-service",
        availabilityStatus: "Available",
        verificationStatus: "Verified",
        approvalStatus: WorkflowStatus.APPROVED
    },
    {
        providerName: "Nimba Finance Link",
        providerType: "Financial Institution",
        registrationStatus: "Registered",
        areaOfExpertise: ["MSME Lending", "Credit Assessment"],
        servicesOffered: ["Financing", "Financial Literacy"],
        contactPerson: "Prince G. Yollah",
        phoneNumber: "+231880000203",
        email: "branch@nfl.lr",
        county: "Nimba",
        district: "Ganta",
        sector: "Services",
        subsector: "Professional Services",
        yearsOfExperience: 11,
        targetBeneficiaries: ["Verified MSMEs"],
        staffCapacity: 23,
        certifications: ["CBL Licensed"],
        servicePricingModel: "Loan portfolio pricing",
        availabilityStatus: "Available",
        verificationStatus: "Under Review",
        approvalStatus: WorkflowStatus.UNDER_REVIEW
    }
];
const sampleReports = [
    {
        title: "Monthly MSME Registration Report - April 2026",
        type: ReportType.MONTHLY_MSME_REGISTRATION,
        reportingPeriod: "2026-04",
        summaryData: {
            totalMsmes: 482,
            verifiedMsmes: 311,
            womenLedShare: 0.39,
            youthLedShare: 0.44
        }
    },
    {
        title: "Women and Youth Entrepreneurship Report - Q1 2026",
        type: ReportType.WOMEN_YOUTH_ENTREPRENEURSHIP,
        reportingPeriod: "2026-Q1",
        summaryData: {
            totalWomenLed: 164,
            totalYouthLed: 202,
            topCounty: "Montserrado"
        }
    }
];
async function main() {
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.reportExport.deleteMany();
    await prisma.report.deleteMany();
    await prisma.opportunityMatch.deleteMany();
    await prisma.opportunityCounty.deleteMany();
    await prisma.opportunity.deleteMany();
    await prisma.verificationVisit.deleteMany();
    await prisma.workflowAction.deleteMany();
    await prisma.bdspSupportRecord.deleteMany();
    await prisma.bdspCountyCoverage.deleteMany();
    await prisma.bdspService.deleteMany();
    await prisma.bdspDocument.deleteMany();
    await prisma.bdsp.deleteMany();
    await prisma.msmeProduct.deleteMany();
    await prisma.msmeDocument.deleteMany();
    await prisma.msmeOwner.deleteMany();
    await prisma.msme.deleteMany();
    await prisma.importError.deleteMany();
    await prisma.importBatch.deleteMany();
    await prisma.offlineSyncRecord.deleteMany();
    await prisma.fieldCollectionSession.deleteMany();
    await prisma.dataAccessLog.deleteMany();
    await prisma.loginHistory.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userInvitation.deleteMany();
    await prisma.user.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.lookupItem.deleteMany();
    await prisma.subsector.deleteMany();
    await prisma.sector.deleteMany();
    await prisma.district.deleteMany();
    await prisma.county.deleteMany();
    await prisma.systemSetting.deleteMany();
    for (const county of counties) {
        await prisma.county.create({
            data: {
                code: county.toUpperCase().replace(/\s+/g, "_"),
                name: county
            }
        });
    }
    const countyRecords = await prisma.county.findMany();
    const countyByName = new Map(countyRecords.map((county) => [county.name, county]));
    for (const [countyName, districts] of Object.entries(districtMap)) {
        const county = countyByName.get(countyName);
        if (!county)
            continue;
        for (const districtName of districts) {
            await prisma.district.create({
                data: {
                    countyId: county.id,
                    code: `${county.code}-${districtName.toUpperCase().replace(/\s+/g, "_")}`,
                    name: districtName
                }
            });
        }
    }
    for (const sector of sectors) {
        const createdSector = await prisma.sector.create({
            data: {
                code: sector.code,
                name: sector.name
            }
        });
        for (const subsector of sector.subsectors) {
            await prisma.subsector.create({
                data: {
                    sectorId: createdSector.id,
                    code: `${sector.code}-${subsector.toUpperCase().replace(/\s+/g, "_")}`,
                    name: subsector
                }
            });
        }
    }
    for (const item of lookupItems) {
        await prisma.lookupItem.create({
            data: {
                category: item[0],
                code: item[1],
                name: item[2]
            }
        });
    }
    for (const permission of permissions) {
        await prisma.permission.create({ data: permission });
    }
    for (const role of roles) {
        await prisma.role.create({ data: role });
    }
    const permissionRecords = await prisma.permission.findMany();
    const roleRecords = await prisma.role.findMany();
    const permissionByKey = new Map(permissionRecords.map((permission) => [permission.key, permission]));
    const roleByKey = new Map(roleRecords.map((role) => [role.key, role]));
    for (const [roleKey, permissionKeys] of Object.entries(roleMap)) {
        const role = roleByKey.get(roleKey);
        if (!role)
            continue;
        for (const permissionKey of permissionKeys) {
            const permission = permissionByKey.get(permissionKey);
            if (!permission)
                continue;
            await prisma.rolePermission.create({
                data: {
                    roleId: role.id,
                    permissionId: permission.id
                }
            });
        }
    }
    const districtRecords = await prisma.district.findMany({ include: { county: true } });
    const districtKey = (countyName, districtName) => `${countyName}:${districtName}`;
    const districtByName = new Map(districtRecords.map((district) => [districtKey(district.county.name, district.name), district]));
    const passwordHash = await hash("ChangeMe123!");
    const createdUsers = [];
    for (const user of users) {
        const county = countyByName.get(user.county);
        const createdUser = await prisma.user.create({
            data: {
                email: user.email,
                fullName: user.fullName,
                passwordHash,
                accountStatus: "ACTIVE",
                countyId: county.id,
                lastPasswordChangeAt: new Date(),
                activatedAt: new Date()
            }
        });
        const role = roleByKey.get(user.roleKey);
        await prisma.userRole.create({
            data: {
                userId: createdUser.id,
                roleId: role.id
            }
        });
        await prisma.loginHistory.create({
            data: {
                userId: createdUser.id,
                email: user.email,
                successful: true,
                ipAddress: "127.0.0.1",
                userAgent: "seed-script"
            }
        });
        createdUsers.push({ ...createdUser, roleKey: user.roleKey });
    }
    const userByEmail = new Map(createdUsers.map((user) => [user.email, user]));
    const sectorRecords = await prisma.sector.findMany();
    const subsectorRecords = await prisma.subsector.findMany({ include: { sector: true } });
    const sectorByName = new Map(sectorRecords.map((sector) => [sector.name, sector]));
    const subsectorByName = new Map(subsectorRecords.map((subsector) => [`${subsector.sector.name}:${subsector.name}`, subsector]));
    const adminUser = userByEmail.get("sba.admin@sba.gov.lr");
    const supervisorUser = userByEmail.get("supervisor@sba.gov.lr");
    const inspectorUser = userByEmail.get("inspector@sba.gov.lr");
    const createdMsmes = [];
    for (const msme of msmeSeeds) {
        const county = countyByName.get(msme.county);
        const district = districtByName.get(districtKey(msme.county, msme.district));
        const sector = sectorByName.get(msme.sector);
        const subsector = subsectorByName.get(`${msme.sector}:${msme.subsector}`);
        const createdMsme = await prisma.msme.create({
            data: {
                businessName: msme.businessName,
                businessType: msme.businessType,
                msmeCategory: msme.msmeCategory,
                formalityStatus: msme.formalityStatus,
                sectorId: sector?.id,
                subsectorId: subsector?.id,
                countyId: county.id,
                districtId: district?.id,
                cityTownCommunity: msme.cityTownCommunity,
                physicalAddress: msme.physicalAddress,
                contactPerson: msme.contactPerson,
                phoneNumber: msme.phoneNumber,
                ownerName: msme.ownerName,
                ownerGender: msme.ownerGender,
                ownerAge: msme.ownerAge,
                youthLed: msme.youthLed,
                womenLed: msme.womenLed,
                numberOfEmployees: msme.numberOfEmployees,
                numberOfFemaleEmployees: msme.numberOfFemaleEmployees,
                numberOfYouthEmployees: msme.numberOfYouthEmployees,
                annualRevenueRange: msme.annualRevenueRange,
                businessStage: msme.businessStage,
                financingNeeds: msme.financingNeeds,
                trainingNeeds: msme.trainingNeeds,
                productsServicesOffered: msme.productsServicesOffered,
                verificationStatus: msme.verificationStatus,
                approvalStatus: msme.approvalStatus,
                dataSource: DataSource.MANUAL,
                createdById: adminUser.id,
                updatedById: adminUser.id,
                dateVerified: msme.verificationStatus === "Verified" ? new Date() : null,
                optedInForFinancing: msme.optedInForFinancing,
                owners: {
                    create: {
                        fullName: msme.ownerName,
                        gender: msme.ownerGender,
                        age: msme.ownerAge,
                        phoneNumber: msme.phoneNumber,
                        isPrimary: true
                    }
                }
            }
        });
        await prisma.workflowAction.create({
            data: {
                entityType: "MSME",
                entityId: createdMsme.id,
                msmeId: createdMsme.id,
                fromStatus: WorkflowStatus.DRAFT,
                toStatus: msme.approvalStatus,
                actionByUserId: adminUser.id,
                assignedToUserId: supervisorUser.id,
                notes: "Seeded workflow state"
            }
        });
        await prisma.msmeProduct.create({
            data: {
                msmeId: createdMsme.id,
                sectorId: sector?.id,
                countyId: county.id,
                productName: `${msme.businessName} Flagship Offering`,
                category: sector?.name ?? "General",
                description: msme.productsServicesOffered,
                priceRange: "Contact for quotation",
                unitOfMeasure: "Unit",
                productionCapacity: "Up to 500 units/month",
                availabilityStatus: "Available",
                marketReadiness: "Commercial",
                exportReadiness: "Emerging",
                approvalStatus: msme.approvalStatus,
                createdById: adminUser.id,
                updatedById: adminUser.id
            }
        });
        if (msme.verificationStatus === "Verified") {
            await prisma.verificationVisit.create({
                data: {
                    msmeId: createdMsme.id,
                    countyId: county.id,
                    verificationOfficerId: inspectorUser.id,
                    visitDate: new Date(),
                    visitOutcome: "Business verified in field",
                    verificationStatus: WorkflowStatus.VERIFIED,
                    notes: "Ownership and business activity confirmed."
                }
            });
        }
        createdMsmes.push(createdMsme);
    }
    const createdBdsps = [];
    for (const bdsp of bdspSeeds) {
        const county = countyByName.get(bdsp.county);
        const district = districtByName.get(districtKey(bdsp.county, bdsp.district));
        const sector = sectorByName.get(bdsp.sector);
        const subsector = subsectorByName.get(`${bdsp.sector}:${bdsp.subsector}`);
        const createdBdsp = await prisma.bdsp.create({
            data: {
                providerName: bdsp.providerName,
                providerType: bdsp.providerType,
                registrationStatus: bdsp.registrationStatus,
                areaOfExpertise: bdsp.areaOfExpertise,
                servicesOffered: bdsp.servicesOffered,
                contactPerson: bdsp.contactPerson,
                phoneNumber: bdsp.phoneNumber,
                email: bdsp.email,
                website: bdsp.website,
                countyId: county.id,
                districtId: district?.id,
                sectorId: sector?.id,
                subsectorId: subsector?.id,
                yearsOfExperience: bdsp.yearsOfExperience,
                targetBeneficiaries: bdsp.targetBeneficiaries,
                staffCapacity: bdsp.staffCapacity,
                certifications: bdsp.certifications,
                servicePricingModel: bdsp.servicePricingModel,
                availabilityStatus: bdsp.availabilityStatus,
                verificationStatus: bdsp.verificationStatus,
                approvalStatus: bdsp.approvalStatus,
                createdById: adminUser.id,
                updatedById: adminUser.id,
                countiesServed: {
                    create: [{ countyId: county.id }]
                },
                services: {
                    create: bdsp.servicesOffered.map((serviceName) => ({
                        serviceCategory: serviceName,
                        serviceName,
                        description: `${serviceName} support offering`
                    }))
                }
            }
        });
        await prisma.workflowAction.create({
            data: {
                entityType: "BDSP",
                entityId: createdBdsp.id,
                bdspId: createdBdsp.id,
                fromStatus: WorkflowStatus.DRAFT,
                toStatus: bdsp.approvalStatus,
                actionByUserId: adminUser.id,
                assignedToUserId: supervisorUser.id,
                notes: "Seeded workflow state"
            }
        });
        createdBdsps.push(createdBdsp);
    }
    await prisma.bdspSupportRecord.create({
        data: {
            bdspId: createdBdsps[0].id,
            msmeId: createdMsmes[0].id,
            supportType: "Training",
            supportTitle: "Financial Literacy Bootcamp",
            description: "Quarterly bookkeeping and growth planning support",
            supportDate: new Date(),
            outcomeSummary: "MSME completed bookkeeping module",
            createdById: adminUser.id
        }
    });
    const opportunity = await prisma.opportunity.create({
        data: {
            title: "Women-Led Agro Processing Equipment Grant",
            description: "Equipment support opportunity targeting verified agro-processing MSMEs.",
            type: OpportunityType.EQUIPMENT_SUPPORT,
            status: OpportunityStatus.OPEN,
            eligibilityCriteria: "Verified women-led MSMEs in agriculture and food processing",
            opensAt: new Date(),
            closesAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            createdById: adminUser.id,
            updatedById: adminUser.id,
            counties: {
                create: [
                    { countyId: countyByName.get("Bong").id },
                    { countyId: countyByName.get("Lofa").id },
                    { countyId: countyByName.get("Montserrado").id }
                ]
            }
        }
    });
    await prisma.opportunityMatch.create({
        data: {
            opportunityId: opportunity.id,
            msmeId: createdMsmes[0].id,
            expressionOfInterest: true,
            status: WorkflowStatus.UNDER_REVIEW,
            notes: "Shortlisted for equipment grant."
        }
    });
    for (const reportSeed of sampleReports) {
        const report = await prisma.report.create({
            data: {
                title: reportSeed.title,
                type: reportSeed.type,
                reportingPeriod: reportSeed.reportingPeriod,
                summaryData: reportSeed.summaryData,
                status: WorkflowStatus.APPROVED,
                generatedById: adminUser.id,
                generatedAt: new Date()
            }
        });
        await prisma.reportExport.create({
            data: {
                reportId: report.id,
                format: ReportFormat.PDF,
                filePath: `/reports/${report.id}.pdf`,
                fileSizeBytes: 245760,
                exportedById: adminUser.id
            }
        });
    }
    await prisma.fieldCollectionSession.create({
        data: {
            countyId: countyByName.get("Bong").id,
            deviceIdentifier: "tablet-bong-001",
            appVersion: "1.0.0",
            recordsCollected: 12,
            pendingSyncCount: 2,
            syncedCount: 10,
            rejectedCount: 0,
            metadata: {
                mode: "offline"
            },
            syncRecords: {
                create: [
                    {
                        entityType: "MSME",
                        localRecordId: "offline-msme-1001",
                        payload: { businessName: "Offline Palm Oil Traders" },
                        syncStatus: "PENDING",
                        createdById: userByEmail.get("data.officer@sba.gov.lr").id
                    },
                    {
                        entityType: "BDSP",
                        localRecordId: "offline-bdsp-1002",
                        payload: { providerName: "Offline Field Trainer" },
                        syncStatus: "FAILED",
                        lastError: "Duplicate provider phone detected",
                        retryCount: 1,
                        createdById: userByEmail.get("data.officer@sba.gov.lr").id
                    }
                ]
            }
        }
    });
    for (const user of createdUsers) {
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: "REPORT_GENERATED",
                title: "Platform Seed Completed",
                message: "Your environment has been initialized with users, master data, and sample registry records.",
                entityType: "REPORT"
            }
        });
    }
    await prisma.auditLog.createMany({
        data: [
            {
                userId: adminUser.id,
                action: AuditAction.CREATE,
                entityType: "MSME",
                entityId: createdMsmes[0].id,
                description: "Sample MSME created during seed"
            },
            {
                userId: adminUser.id,
                action: AuditAction.CREATE,
                entityType: "BDSP",
                entityId: createdBdsps[0].id,
                description: "Sample BDSP created during seed"
            },
            {
                userId: adminUser.id,
                action: AuditAction.EXPORT,
                entityType: "REPORT",
                description: "Seed report export generated"
            }
        ]
    });
    await prisma.systemSetting.createMany({
        data: [
            {
                category: "security",
                key: "password_policy",
                value: {
                    minLength: 12,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumber: true,
                    requireSymbol: true
                },
                description: "Baseline platform password policy"
            },
            {
                category: "retention",
                key: "data_retention_policy",
                value: {
                    auditLogsMonths: 24,
                    loginHistoryMonths: 12,
                    softDeleteGraceDays: 90
                },
                description: "Data retention defaults"
            },
            {
                category: "reports",
                key: "default_report_branding",
                value: {
                    ministry: "Ministry of Commerce and Industry",
                    agency: "Bureau of Small Business Administration",
                    project: "PAYEI / YEIB"
                },
                description: "Report cover metadata"
            }
        ]
    });
    console.log("Seed complete");
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
