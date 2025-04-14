-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParsedRecord" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "sheetOrNode" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "rowNum" INTEGER,
    "parentContext" TEXT,
    "fullPath" TEXT,

    CONSTRAINT "ParsedRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_filename_key" ON "File"("filename");

-- CreateIndex
CREATE INDEX "ParsedRecord_fileId_idx" ON "ParsedRecord"("fileId");

-- CreateIndex
CREATE INDEX "ParsedRecord_fieldName_idx" ON "ParsedRecord"("fieldName");

-- CreateIndex
CREATE INDEX "ParsedRecord_fieldValue_idx" ON "ParsedRecord"("fieldValue");

-- CreateIndex
CREATE INDEX "ParsedRecord_sheetOrNode_idx" ON "ParsedRecord"("sheetOrNode");

-- AddForeignKey
ALTER TABLE "ParsedRecord" ADD CONSTRAINT "ParsedRecord_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
