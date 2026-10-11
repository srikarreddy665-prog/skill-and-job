import { jsPDF } from 'jspdf';
import {
  AssessmentSession,
  JobMatchResult,
  SkillProfile,
} from '../types/index.ts';

export interface PDFExportOptions {
  includeTranscript?: boolean;
  includeJobMatches?: boolean;
  includeGapsAndStrengths?: boolean;
}

export function generateCandidatePDFReport(
  profile: SkillProfile,
  session: AssessmentSession | null,
  jobMatches: JobMatchResult[],
  options: PDFExportOptions = {
    includeTranscript: true,
    includeJobMatches: true,
    includeGapsAndStrengths: true,
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 5;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('SkillPulse · Autonomous Technical Evaluation Report', margin, margin - 6);
    doc.text(
      new Date().toLocaleDateString(),
      pageWidth - margin,
      margin - 6,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(margin, margin - 4, pageWidth - margin, margin - 4);
  };

  // ------------------------------------
  // Page 1: Header & Executive Summary
  // ------------------------------------

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Technical Skill & Assessment Report', margin, y);
  y += 7;

  // Metadata Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateStr = new Date(profile.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Domain: ${profile.domain}   ·   Evaluated: ${dateStr}`, margin, y);
  y += 9;

  // Readiness Tier Banner (Dark sleek box)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('VERIFIED READINESS TIER', margin + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(profile.overallReadinessTier, margin + 6, y + 15);

  // Overall Score Callout
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('OVERALL SCORE', pageWidth - margin - 26, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(`${profile.overallScore} / 100`, pageWidth - margin - 26, y + 16);

  y += 30;

  // Executive Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Evaluation Summary', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85); // slate-700
  const summaryLines = doc.splitTextToSize(profile.executiveSummary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.2 + 6;

  // Verified Strengths & Interview Notes
  if (options.includeGapsAndStrengths) {
    checkPageBreak(35);

    // Two-column layout for Strengths & Advisory
    const colWidth = (contentWidth - 6) / 2;

    // Left Column: Key Strengths
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text('Verified Technical Strengths', margin, y);

    let leftY = y + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    (profile.keyStrengths || []).slice(0, 4).forEach((str) => {
      const lines = doc.splitTextToSize(`• ${str}`, colWidth);
      doc.text(lines, margin, leftY);
      leftY += lines.length * 3.8 + 1.5;
    });

    // Right Column: Evaluator Advisory & Risks
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text('Evaluator Interview Advisory', margin + colWidth + 6, y);

    let rightY = y + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    (profile.interviewRiskNotes || []).slice(0, 4).forEach((note) => {
      const lines = doc.splitTextToSize(`• ${note}`, colWidth);
      doc.text(lines, margin + colWidth + 6, rightY);
      rightY += lines.length * 3.8 + 1.5;
    });

    y = Math.max(leftY, rightY) + 6;
  }

  // ------------------------------------
  // Dimensional Proficiency Matrix Table
  // ------------------------------------
  checkPageBreak(50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Skill Proficiency Matrix (0 - 10 Scale)', margin, y);
  y += 5;

  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Skill Dimension', margin + 3, y + 4.8);
  doc.text('Score', margin + 85, y + 4.8);
  doc.text('Benchmark', margin + 110, y + 4.8);
  doc.text('Delta', margin + 135, y + 4.8);
  doc.text('Status', margin + 155, y + 4.8);
  y += 8;

  // Table Rows
  profile.dimensions.forEach((dim, idx) => {
    checkPageBreak(8);

    const target = dim.benchmarkMinRequired || 7.5;
    const delta = Number((dim.score - target).toFixed(1));
    const isMet = dim.score >= target;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 1, contentWidth, 6.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(dim.name, margin + 3, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`${dim.score.toFixed(1)} / 10`, margin + 85, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${target.toFixed(1)} / 10`, margin + 110, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(isMet ? 22 : 217, isMet ? 101 : 119, isMet ? 52 : 6);
    doc.text(delta > 0 ? `+${delta}` : `${delta}`, margin + 135, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isMet ? 22 : 180, isMet ? 101 : 83, isMet ? 52 : 9);
    doc.text(isMet ? 'Met Standard' : 'Upskill Gap', margin + 155, y + 3.5);

    y += 6.5;
  });

  y += 6;

  // ------------------------------------
  // Benchmark Job Matches Section
  // ------------------------------------
  if (options.includeJobMatches && jobMatches.length > 0) {
    checkPageBreak(45);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Standard Benchmark Job Compatibility', margin, y);
    y += 5;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Role Title', margin + 3, y + 4.8);
    doc.text('Experience Tier', margin + 80, y + 4.8);
    doc.text('Match %', margin + 125, y + 4.8);
    doc.text('Readiness Verdict', margin + 150, y + 4.8);
    y += 8;

    jobMatches.slice(0, 5).forEach((match, idx) => {
      checkPageBreak(8);

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 1, contentWidth, 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(match.job.title, margin + 3, y + 3.5);

      doc.setTextColor(100, 116, 139);
      doc.text(match.job.experienceLevel, margin + 80, y + 3.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(
        match.status === 'ready'
          ? 22
          : match.status === 'upskill_needed'
          ? 37
          : 217,
        match.status === 'ready'
          ? 101
          : match.status === 'upskill_needed'
          ? 99
          : 119,
        match.status === 'ready'
          ? 52
          : match.status === 'upskill_needed'
          ? 235
          : 6
      );
      doc.text(`${match.matchPercentage}%`, margin + 125, y + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(match.statusLabel, margin + 150, y + 3.5);

      y += 6.5;
    });

    y += 6;
  }

  // ------------------------------------
  // Full Interview Transcript Audit Section
  // ------------------------------------
  if (options.includeTranscript && session && session.transcript.length > 0) {
    doc.addPage();
    y = margin + 5;
    drawPageHeader();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Diagnostic Assessment Interview Transcript Audit', margin, y);
    y += 6;

    session.transcript.forEach((turn) => {
      checkPageBreak(38);

      // Turn Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Turn ${turn.turnIndex}: ${turn.difficulty.toUpperCase()} DIFFICULTY`, margin + 3, y + 4.2);

      if (turn.score !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`Turn Score: ${turn.score.toFixed(1)} / 10`, pageWidth - margin - 4, y + 4.2, {
          align: 'right',
        });
      }
      y += 9;

      // Scenario & Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Scenario Context:', margin + 2, y);
      y += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const scenarioLines = doc.splitTextToSize(turn.scenario, contentWidth - 4);
      doc.text(scenarioLines, margin + 2, y);
      y += scenarioLines.length * 3.4 + 3;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 64, 175);
      doc.text('Question Posed:', margin + 2, y);
      y += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 58, 138);
      const qLines = doc.splitTextToSize(turn.questionText, contentWidth - 4);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 3.4 + 3;

      // Candidate's answer
      if (turn.userAnswer) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        doc.text('Candidate Reasoning:', margin + 2, y);
        y += 3.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        const ansLines = doc.splitTextToSize(turn.userAnswer, contentWidth - 4);
        doc.text(ansLines, margin + 2, y);
        y += ansLines.length * 3.4 + 3;
      }

      // Evaluator feedback
      if (turn.evaluatorFeedback) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(120, 53, 15);
        doc.text('Diagnostic Evaluator Feedback:', margin + 2, y);
        y += 3.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(146, 64, 14);
        const fbLines = doc.splitTextToSize(turn.evaluatorFeedback, contentWidth - 4);
        doc.text(fbLines, margin + 2, y);
        y += fbLines.length * 3.4 + 5;
      }

      y += 2;
    });
  }

  // Page numbering on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SkillPulse Candidate Evaluation Report · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Trigger download
  const safeFilename = `SkillPulse_Evaluation_${profile.domain.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(safeFilename);
}
