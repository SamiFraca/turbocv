const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function generateTestPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a blank page
  const page = pdfDoc.addPage([612, 792]); // Letter size
  
  // Set font size and color
  const fontSize = 12;
  const color = rgb(0, 0, 0);
  
  // Add content to the page
  const content = `
John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567 | San Francisco, CA

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of expertise in React, TypeScript, and Node.js. 
Proven track record of delivering high-quality web applications and leading development teams.

EXPERIENCE
Senior Frontend Developer | Tech Corp | 2021-Present
- Led development of React-based applications serving 1M+ users
- Implemented performance optimizations reducing load time by 40%
- Mentored junior developers and conducted code reviews

Full Stack Developer | StartupXYZ | 2019-2021
- Built full-stack applications using React, Node.js, and PostgreSQL
- Developed RESTful APIs and real-time features with WebSockets
- Collaborated with UX team to implement responsive designs

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015-2019

SKILLS
- Languages: JavaScript, TypeScript, Python, SQL
- Frameworks: React, Next.js, Node.js, Express
- Tools: Git, Docker, AWS, Jest, Webpack
- Databases: PostgreSQL, MongoDB, Redis
`;

  // Draw text on the page
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;
  
  const lines = content.split('\n');
  for (const line of lines) {
    if (yPosition < margin) break;
    
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: color,
    });
    
    yPosition -= fontSize * 1.5;
  }
  
  // Serialize the PDF document to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Write the PDF to a file
  fs.writeFileSync('tests/fixtures/sample-cv.pdf', pdfBytes);
  
  console.log('Test PDF generated successfully: tests/fixtures/sample-cv.pdf');
}

generateTestPDF().catch(console.error);
