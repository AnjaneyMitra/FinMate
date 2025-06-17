import React from 'react';
import { Download, Share2, Printer } from 'lucide-react';

const ContentActions = ({ content, topic, onPrint, onDownload, onShare }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable text file with the content
    const contentText = `
${content.title || topic}
${content.title ? '=' : ''}${'='.repeat(content.title?.length || topic.length)}

${content.introduction ? `Introduction:\n${content.introduction}\n\n` : ''}

${content.main_content}

${content.key_takeaways?.length ? `\nKey Takeaways:\n${content.key_takeaways.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n` : ''}

${content.specific_recommendations?.length ? `\nPersonalized Recommendations:\n${content.specific_recommendations.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n` : ''}

${content.next_steps?.length ? `\nNext Steps:\n${content.next_steps.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n` : ''}

${content.risk_disclaimers ? `\nRisk Disclaimers:\n${content.risk_disclaimers}` : ''}

Generated: ${content.generated_at ? new Date(content.generated_at).toLocaleString() : new Date().toLocaleString()}
Source: FinMate Investment Learning Platform
    `.trim();

    const blob = new Blob([contentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(content.title || topic).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: content.title || topic,
      text: `Check out this personalized investment learning content: ${content.title || topic}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    // Fallback to copying URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(() => {
        alert('Unable to copy link. Please copy the URL manually.');
      });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
      <button
        onClick={handlePrint}
        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Printer className="w-4 h-4" />
        <span>Print</span>
      </button>
      
      <button
        onClick={handleDownload}
        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
      
      <button
        onClick={handleShare}
        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>
    </div>
  );
};

export default ContentActions;
