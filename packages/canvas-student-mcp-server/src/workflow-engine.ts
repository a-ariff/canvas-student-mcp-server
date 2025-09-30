/**
 * Academic Workflow Engine
 * Handles assignment workflows, seminar analysis, and task automation
 */

import { z } from 'zod';

// Workflow template schema
export const WorkflowTemplateSchema = z.object({
  // Assignment fields
  course_name: z.string().optional(),
  module_title: z.string().optional(),
  assignment_title: z.string().optional(),
  word_count: z.number().optional(),
  citation_style: z.string().optional(),
  due_date: z.string().optional(),
  tools_allowed: z.string().optional(),
  assignment_text: z.string().optional(),
  rubric_text: z.string().optional(),
  notes_from_student: z.string().optional(),

  // Seminar/Video fields
  seminar_title: z.string().optional(),
  seminar_content: z.string().optional(),
  analysis_focus: z.string().optional(),
  seminar_deliverables: z.string().optional(),

  // Automation fields
  automation_task: z.string().optional(),
  automation_platform: z.string().optional(),
  automation_outputs: z.string().optional(),
  integration_requirements: z.string().optional(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

export interface WorkflowSection {
  title: string;
  content: string;
}

export class WorkflowEngine {
  /**
   * Detect workflow type from template
   */
  detectWorkflowType(template: WorkflowTemplate): 'assignment' | 'seminar' | 'automation' | 'unknown' {
    if (template.assignment_text || template.rubric_text) {
      return 'assignment';
    }
    if (template.seminar_content || template.seminar_title) {
      return 'seminar';
    }
    if (template.automation_task || template.automation_platform) {
      return 'automation';
    }
    return 'unknown';
  }

  /**
   * Process assignment workflow
   */
  processAssignmentWorkflow(template: WorkflowTemplate): WorkflowSection[] {
    const sections: WorkflowSection[] = [];

    // Section A: Requirements Extraction
    sections.push({
      title: 'Section A: Requirements Extraction',
      content: this.extractRequirements(template),
    });

    // Section B: Rubric Analysis
    if (template.rubric_text) {
      sections.push({
        title: 'Section B: Rubric-Aligned Outline',
        content: this.analyzeRubric(template.rubric_text),
      });
    }

    // Section C: Research Plan
    sections.push({
      title: 'Section C: Research Plan',
      content: this.createResearchPlan(template),
    });

    // Section D: Assignment Scaffold
    sections.push({
      title: 'Section D: Assignment Scaffold',
      content: this.createAssignmentScaffold(template),
    });

    // Section E: Writing Guidelines
    sections.push({
      title: 'Section E: Writing Guidelines',
      content: this.generateWritingGuidelines(template),
    });

    return sections;
  }

  /**
   * Process seminar/video analysis workflow
   */
  processSeminarWorkflow(template: WorkflowTemplate): WorkflowSection[] {
    const sections: WorkflowSection[] = [];

    sections.push({
      title: 'Key Concepts & Frameworks',
      content: this.extractKeyConcepts(template.seminar_content || ''),
    });

    sections.push({
      title: 'Structured Notes',
      content: this.createStructuredNotes(template.seminar_content || ''),
    });

    if (template.analysis_focus) {
      sections.push({
        title: 'Focus Area Analysis',
        content: this.analyzeFocusAreas(template.analysis_focus, template.seminar_content || ''),
      });
    }

    sections.push({
      title: 'Reflection Questions',
      content: this.generateReflectionQuestions(template.seminar_content || ''),
    });

    return sections;
  }

  /**
   * Extract requirements from assignment
   */
  private extractRequirements(template: WorkflowTemplate): string {
    let requirements = '**Assignment Requirements Analysis**\n\n';

    if (template.assignment_title) {
      requirements += `**Title:** ${template.assignment_title}\n`;
    }
    if (template.course_name) {
      requirements += `**Course:** ${template.course_name}\n`;
    }
    if (template.module_title) {
      requirements += `**Module:** ${template.module_title}\n`;
    }
    if (template.word_count) {
      requirements += `**Word Count:** ${template.word_count}\n`;
    }
    if (template.citation_style) {
      requirements += `**Citation Style:** ${template.citation_style}\n`;
    }
    if (template.due_date) {
      requirements += `**Due Date:** ${template.due_date}\n`;
    }

    requirements += '\n**Core Requirements:**\n';

    if (template.assignment_text) {
      // Parse assignment text for key requirements
      const lines = template.assignment_text.split('\n');
      const keyPhrases = [
        'must', 'should', 'required', 'include', 'demonstrate',
        'analyze', 'evaluate', 'discuss', 'explain', 'compare'
      ];

      lines.forEach((line, idx) => {
        if (keyPhrases.some(phrase => line.toLowerCase().includes(phrase))) {
          requirements += `${idx + 1}. ${line.trim()}\n`;
        }
      });
    }

    if (template.notes_from_student) {
      requirements += `\n**Student Notes:**\n${template.notes_from_student}\n`;
    }

    return requirements;
  }

  /**
   * Analyze rubric and create alignment structure
   */
  private analyzeRubric(rubricText: string): string {
    let analysis = '**Rubric Analysis & Alignment Strategy**\n\n';

    // Parse rubric for criteria and levels
    const criteriaRegex = /(?:criterion|criteria|category):\s*([^\n]+)/gi;
    const criteria = [];
    let match;

    while ((match = criteriaRegex.exec(rubricText)) !== null) {
      criteria.push(match[1].trim());
    }

    if (criteria.length > 0) {
      analysis += '**Assessment Criteria:**\n';
      criteria.forEach((criterion, idx) => {
        analysis += `${idx + 1}. ${criterion}\n`;
      });
      analysis += '\n';
    }

    // Identify grade levels
    const gradeRegex = /(?:excellent|good|satisfactory|needs improvement|poor|HD|D|C|P|F)/gi;
    const grades = rubricText.match(gradeRegex);

    if (grades && grades.length > 0) {
      const uniqueGrades = [...new Set(grades.map(g => g.toLowerCase()))];
      analysis += `**Grade Levels Identified:** ${uniqueGrades.join(', ')}\n\n`;
    }

    analysis += '**Rubric Alignment Strategy:**\n';
    analysis += '1. Address each criterion explicitly in assignment structure\n';
    analysis += '2. Use rubric language in topic sentences\n';
    analysis += '3. Ensure evidence meets highest level descriptors\n';
    analysis += '4. Cross-reference sections to criteria throughout\n';

    return analysis;
  }

  /**
   * Create research plan with evidence table
   */
  private createResearchPlan(template: WorkflowTemplate): string {
    let plan = '**Research & Evidence Planning**\n\n';

    plan += '**Research Strategy:**\n';
    plan += '1. Identify key concepts from assignment requirements\n';
    plan += '2. Search academic databases (Canvas library, Google Scholar)\n';
    plan += '3. Review course materials and readings\n';
    plan += '4. Find 5-7 credible sources minimum\n\n';

    if (template.citation_style) {
      plan += `**Citation Format:** ${template.citation_style}\n\n`;
    }

    plan += '**Evidence Table Template:**\n\n';
    plan += '| Source | Type | Key Argument | Quote/Data | Page/Para | Use In Section |\n';
    plan += '|--------|------|--------------|------------|-----------|----------------|\n';
    plan += '| Author (Year) | Journal/Book | Main point | "Quote or data" | p.XX | Introduction |\n';
    plan += '| | | | | | |\n';
    plan += '| | | | | | |\n\n';

    plan += '**Quality Checklist:**\n';
    plan += '- [ ] Sources published within last 5-10 years\n';
    plan += '- [ ] Peer-reviewed academic sources prioritized\n';
    plan += '- [ ] Multiple perspectives represented\n';
    plan += '- [ ] Direct relevance to assignment question\n';
    plan += '- [ ] Proper citation format verified\n';

    return plan;
  }

  /**
   * Create assignment scaffold/outline
   */
  private createAssignmentScaffold(template: WorkflowTemplate): string {
    let scaffold = '**Assignment Structure Scaffold**\n\n';

    const wordCount = template.word_count || 1500;
    const intro = Math.floor(wordCount * 0.1);
    const body = Math.floor(wordCount * 0.75);
    const conclusion = Math.floor(wordCount * 0.15);

    scaffold += `**Total Word Count:** ${wordCount} words\n\n`;

    scaffold += `**1. Introduction (${intro} words)**\n`;
    scaffold += '   - Hook/context\n';
    scaffold += '   - Background information\n';
    scaffold += '   - Thesis statement\n';
    scaffold += '   - Overview of main points\n\n';

    scaffold += `**2. Body Sections (${body} words total)**\n`;
    scaffold += '   \n';
    scaffold += '   **2.1 First Main Point**\n';
    scaffold += '   - Topic sentence (links to rubric criterion)\n';
    scaffold += '   - Evidence from research\n';
    scaffold += '   - Analysis and explanation\n';
    scaffold += '   - Connection to assignment question\n\n';

    scaffold += '   **2.2 Second Main Point**\n';
    scaffold += '   - Topic sentence (links to rubric criterion)\n';
    scaffold += '   - Evidence from research\n';
    scaffold += '   - Analysis and explanation\n';
    scaffold += '   - Connection to assignment question\n\n';

    scaffold += '   **2.3 Third Main Point**\n';
    scaffold += '   - Topic sentence (links to rubric criterion)\n';
    scaffold += '   - Evidence from research\n';
    scaffold += '   - Analysis and explanation\n';
    scaffold += '   - Connection to assignment question\n\n';

    scaffold += `**3. Conclusion (${conclusion} words)**\n`;
    scaffold += '   - Restate thesis\n';
    scaffold += '   - Summarize main points\n';
    scaffold += '   - Final insight/implications\n';
    scaffold += '   - No new information\n\n';

    scaffold += '**4. References**\n';
    if (template.citation_style) {
      scaffold += `   - Formatted in ${template.citation_style}\n`;
    }
    scaffold += '   - Alphabetically ordered\n';
    scaffold += '   - All in-text citations included\n';

    return scaffold;
  }

  /**
   * Generate writing guidelines
   */
  private generateWritingGuidelines(template: WorkflowTemplate): string {
    let guidelines = '**Writing Guidelines & Quality Checklist**\n\n';

    guidelines += '**Academic Writing Standards:**\n';
    guidelines += '- Use simple, clear academic English\n';
    guidelines += '- Avoid contractions (don\'t → do not)\n';
    guidelines += '- Third person perspective (avoid "I" unless reflective)\n';
    guidelines += '- Present tense for current concepts\n';
    guidelines += '- Past tense for historical events/research\n';
    guidelines += '- Topic sentences start each paragraph\n';
    guidelines += '- Transition words between sections\n\n';

    guidelines += '**Formatting Requirements:**\n';
    if (template.word_count) {
      guidelines += `- Word count: ${template.word_count} words (±10%)\n`;
    }
    if (template.citation_style) {
      guidelines += `- Citations: ${template.citation_style} format\n`;
    }
    guidelines += '- Paragraph structure: 150-200 words each\n';
    guidelines += '- Headings: Use if required by rubric\n';
    guidelines += '- Line spacing: Usually 1.5 or double\n';
    guidelines += '- Font: Usually Times New Roman 12pt or Arial 11pt\n\n';

    guidelines += '**Quality Checklist Before Submission:**\n';
    guidelines += '- [ ] All rubric criteria addressed\n';
    guidelines += '- [ ] Word count within range\n';
    guidelines += '- [ ] All sources cited properly\n';
    guidelines += '- [ ] Grammar and spelling checked\n';
    guidelines += '- [ ] Plagiarism checked (Turnitin if available)\n';
    guidelines += '- [ ] Formatting matches requirements\n';
    guidelines += '- [ ] File named correctly\n';
    guidelines += '- [ ] Submitted to correct Canvas assignment\n';

    return guidelines;
  }

  /**
   * Extract key concepts from seminar content
   */
  private extractKeyConcepts(content: string): string {
    let concepts = '**Key Concepts & Frameworks**\n\n';

    // Look for common academic concept markers
    const conceptMarkers = [
      'theory', 'framework', 'model', 'concept', 'principle',
      'approach', 'methodology', 'paradigm', 'perspective'
    ];

    const lines = content.split('\n');
    const foundConcepts: string[] = [];

    lines.forEach(line => {
      conceptMarkers.forEach(marker => {
        if (line.toLowerCase().includes(marker)) {
          foundConcepts.push(line.trim());
        }
      });
    });

    if (foundConcepts.length > 0) {
      concepts += '**Identified Concepts:**\n';
      foundConcepts.slice(0, 10).forEach((concept, idx) => {
        concepts += `${idx + 1}. ${concept}\n`;
      });
    } else {
      concepts += '*Review content and manually identify key theoretical frameworks*\n';
    }

    concepts += '\n**Application Notes:**\n';
    concepts += '- Define each concept clearly\n';
    concepts += '- Provide examples from content\n';
    concepts += '- Connect to course objectives\n';
    concepts += '- Consider practical applications\n';

    return concepts;
  }

  /**
   * Create structured notes from content
   */
  private createStructuredNotes(content: string): string {
    let notes = '**Structured Notes Template**\n\n';

    const sections = content.split('\n\n');

    notes += '**Main Topics:**\n';
    sections.slice(0, 5).forEach((section, idx) => {
      const firstLine = section.split('\n')[0].substring(0, 100);
      notes += `\n**Topic ${idx + 1}:** ${firstLine}...\n`;
      notes += '- Key point 1:\n';
      notes += '- Key point 2:\n';
      notes += '- Key point 3:\n';
    });

    notes += '\n**Connections to Course Material:**\n';
    notes += '- Links to assignment:\n';
    notes += '- Related readings:\n';
    notes += '- Course objectives addressed:\n';

    return notes;
  }

  /**
   * Analyze focus areas
   */
  private analyzeFocusAreas(focusAreas: string, content: string): string {
    let analysis = '**Focus Area Analysis**\n\n';

    const areas = focusAreas.split(',').map(a => a.trim());

    areas.forEach((area, idx) => {
      analysis += `**${idx + 1}. ${area}**\n`;
      analysis += `   - Main points from content:\n`;
      analysis += `   - Evidence/examples:\n`;
      analysis += `   - Critical analysis:\n`;
      analysis += `   - Connection to assignment:\n\n`;
    });

    return analysis;
  }

  /**
   * Generate reflection questions
   */
  private generateReflectionQuestions(content: string): string {
    let questions = '**Reflection Questions**\n\n';

    questions += '**Understanding:**\n';
    questions += '1. What were the main arguments presented?\n';
    questions += '2. What evidence was used to support these arguments?\n';
    questions += '3. What frameworks or theories were discussed?\n\n';

    questions += '**Analysis:**\n';
    questions += '4. What assumptions underpin the main arguments?\n';
    questions += '5. What alternative perspectives could be considered?\n';
    questions += '6. What are the strengths and limitations of the approach?\n\n';

    questions += '**Application:**\n';
    questions += '7. How does this relate to your current assignment?\n';
    questions += '8. What concepts can you apply in your work?\n';
    questions += '9. What further research is needed?\n\n';

    questions += '**Synthesis:**\n';
    questions += '10. How does this connect to other course material?\n';
    questions += '11. What are the practical implications?\n';
    questions += '12. What questions remain unanswered?\n';

    return questions;
  }
}
