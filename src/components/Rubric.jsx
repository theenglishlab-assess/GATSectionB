import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { rubricCriteria } from '../data/rubricData';

const commentBank = [
  "Look to include separate paragraphs so that your ideas are made clearer and your piece has a more solid structure.",
  "Looking to make stronger links to the purpose of the piece, and including more content that aims to connect to the audience will bring improvement.",
  "Some of your marks have been limited by the amount of content that you have produced."
];

const Rubric = () => {
  const [selections, setSelections] = useState({});
  const [comments, setComments] = useState([]);
  const [customComment, setCustomComment] = useState('');
  const [studentName, setStudentName] = useState('');
  const [students, setStudents] = useState([]);

  const handleSelect = (criterionIndex, levelIndex) => {
    if (!rubricCriteria[criterionIndex].levels[levelIndex].clickable) return;
    setSelections((prev) => ({ ...prev, [criterionIndex]: levelIndex }));
  };

  const handleAddComment = (comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleAddCustomComment = () => {
    if (customComment.trim()) {
      setComments((prev) => [...prev, customComment.trim()]);
      setCustomComment('');
    }
  };

  const handleRemoveComment = (index) => {
    setComments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileName = (ext) => {
    const safeName = studentName.trim().replace(/\s+/g, '_') || 'student';
    const date = new Date().toISOString().split('T')[0];
    return `${safeName}-feedback-${date}.${ext}`;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Header
    doc.setFontSize(10);
    doc.text(`Student: ${studentName}`, pageWidth - 60, 10);
  
    doc.setFontSize(16);
    doc.text('Section A Writing Tasks – Assessment and Feedback', pageWidth / 2, 20, { align: 'center' });
  
    doc.setFontSize(11);
    doc.text(
      'Based on the writing of both Part 1 and Part 2, you have been assessed at the following score. Use the highlighted advice to improve your work.',
      pageWidth / 2,
      28,
      { align: 'center' }
    );
  
    const getPageRubric = (criteriaSubset, offset) =>
      criteriaSubset.map((criterion, cIdx) => {
        const row = [criterion.criterion];
        criterion.levels.forEach((level, lIdx) => {
          const isSelected = selections[cIdx + offset] === lIdx;
          row.push({
            content: level.description,
            styles: {
              fillColor: isSelected ? [173, 216, 230] : undefined,
              textColor: 20,
            },
          });
        });
        return row;
      });
  
    const levelsRow = ['Criterion', ...rubricCriteria[0].levels.map((level) => level.level)];
  
    const midpoint = 3;
    const firstHalf = rubricCriteria.slice(0, midpoint);
    const secondHalf = rubricCriteria.slice(midpoint);
  
    autoTable(doc, {
      head: [levelsRow],
      body: getPageRubric(firstHalf, 0),
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2, valign: 'top' },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        halign: 'center',
      },
    });
    
  
    doc.addPage('landscape');
  
    autoTable(doc, {
      head: [levelsRow],
      body: getPageRubric(secondHalf, midpoint),
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2, valign: 'top' },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        halign: 'center',
      },
    });
    
  
    // Further Feedback box
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Further Feedback:', 10, finalY);
    finalY += 4;
  
    const commentText = comments.length > 0 ? comments.join('\n\n') : 'No comments provided.';
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(10, finalY, 270, 30);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(commentText, 265), 12, finalY + 5);
  
    // Total score
    const score = rubricCriteria.reduce((sum, crit, idx) => {
      const val = selections[idx];
      if (val === undefined || crit.levels[val].level === '0/NA') return sum;
      const levelValue = parseInt(crit.levels[val].level, 10);
      return isNaN(levelValue) ? sum : sum + levelValue;
    }, 0);
  
    doc.setFontSize(11);
    doc.text(`Total Score: ${score}`, pageWidth - 60, 200);
  
    doc.save(`${studentName.trim().replace(/\s+/g, '_') || 'student'}-feedback.pdf`);
  };  

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.trim().split('\n');
      const data = lines.slice(1).map(line => {
        const [first, last, group] = line.split(',');
        return {
          name: `${first.trim()} ${last.trim()}`,
          class: group?.trim() || '',
        };
      });
      setStudents(data);
    };
    reader.readAsText(file);
  };
  
  const handleStudentSelect = (e) => {
    const selected = students.find(s => s.name === e.target.value);
    if (selected) {
      setStudentName(selected.name);
    }
  };
  

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Assessment Rubric</h2>
      <div style={{ marginBottom: '1rem' }}>
  <label>
    <strong>Upload Student List (CSV): </strong>
    <input type="file" accept=".csv" onChange={handleCSVUpload} />
  </label>
</div>

{students.length > 0 && (
  <div style={{ marginBottom: '1rem' }}>
    <label>
      <strong>Select Student: </strong>
      <select
        value={studentName}
        onChange={handleStudentSelect}
        style={{ marginLeft: '1rem', padding: '0.5rem' }}
      >
        <option value="">-- Choose a student --</option>
        {students.map((s, idx) => (
          <option key={idx} value={s.name}>
            {s.name} ({s.class})
          </option>
        ))}
      </select>
    </label>
  </div>
)}


      <div style={{ marginBottom: '1rem' }}>
        <strong>Student Name: </strong>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter student name"
          style={{ marginLeft: '1rem', padding: '0.5rem', width: '300px' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Criterion</th>
            {rubricCriteria[0].levels.map((level, idx) => (
              <th key={idx} style={{ border: '1px solid #ccc', padding: '8px' }}>{level.level}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rubricCriteria.map((criterion, cIdx) => (
            <tr key={cIdx}>
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>{criterion.criterion}</td>
              {criterion.levels.map((level, lIdx) => {
                const isSelected = selections[cIdx] === lIdx;
                return (
                  <td
                    key={lIdx}
                    onClick={() => handleSelect(cIdx, lIdx)}
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      cursor: level.clickable ? 'pointer' : 'not-allowed',
                      backgroundColor: isSelected ? '#d0ebff' : level.clickable ? 'white' : '#f0f0f0',
                      fontSize: '0.85rem'
                    }}
                  >
                    {level.description}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '2rem' }}>
        <h3>Comment Bank</h3>
        {commentBank.map((comment, idx) => (
          <button
            key={idx}
            onClick={() => handleAddComment(comment)}
            style={{ display: 'block', margin: '4px 0', padding: '8px', border: '1px solid #ccc' }}
          >
            {comment}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <textarea
          rows="3"
          value={customComment}
          onChange={(e) => setCustomComment(e.target.value)}
          placeholder="Write your comment here..."
          style={{ width: '100%', padding: '0.5rem' }}
        />
        <br />
        <button onClick={handleAddCustomComment}>Add Comment</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Selected Comments</h3>
        <ul>
          {comments.map((comment, idx) => (
            <li key={idx}>
              {comment}
              <button onClick={() => handleRemoveComment(idx)} style={{ marginLeft: '1rem' }}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleExportPDF}
        style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#1976d2', color: 'white', border: 'none' }}
      >
        Export as PDF
      </button>
    </div>
  );
};

export default Rubric;
