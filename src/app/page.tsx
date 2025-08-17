'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryId, setSummaryId] = useState('');
  const [emailList, setEmailList] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTextInputExpanded, setIsTextInputExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [tempTranscript, setTempTranscript] = useState('');
  const [tempSummary, setTempSummary] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openTextModal = () => {
    setTempTranscript(transcript);
    setIsTextModalOpen(true);
  };

  const closeTextModal = () => {
    setIsTextModalOpen(false);
    setTempTranscript('');
  };

  const saveTextModal = () => {
    setTranscript(tempTranscript);
    setIsTextModalOpen(false);
    setTempTranscript('');
  };

  const openSummaryModal = () => {
    setTempSummary(editedSummary);
    setIsSummaryModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setTempSummary('');
  };

  const saveSummaryModal = () => {
    setEditedSummary(tempSummary);
    setIsSummaryModalOpen(false);
    setTempSummary('');
  };

  const addEmail = () => {
    if (emailInput.trim() && !emails.includes(emailInput.trim())) {
      setEmails([...emails, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTranscript(data.text);
        showNotification('success', 'File uploaded and parsed successfully!');
      } else {
        showNotification('error', 'Error parsing file: ' + data.error);
      }
    } catch (error) {
      showNotification('error', 'Error uploading file: ' + error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'text/plain' || file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      handleFileUpload(file);
    } else {
      showNotification('error', 'Please upload a TXT, PDF, or DOCX file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim() || !customPrompt.trim()) {
      showNotification('error', 'Please provide both transcript and custom prompt');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          customPrompt: customPrompt.trim(),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedSummary(data.summary);
        setEditedSummary(data.summary);
        setSummaryId(data.summaryId);
        showNotification('success', 'Summary generated successfully!');
      } else {
        showNotification('error', 'Error generating summary: ' + data.error);
      }
    } catch (error) {
      showNotification('error', 'Error generating summary: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareSummary = async () => {
    if (emails.length === 0) {
      showNotification('error', 'Please add at least one email address');
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch('/api/share-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryId,
          emails,
          summary: editedSummary,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Summary shared successfully!');
        setEmails([]);
        setEmailInput('');
      } else {
        showNotification('error', 'Error sharing summary: ' + data.error);
      }
    } catch (error) {
      showNotification('error', 'Error sharing summary: ' + error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border transition-all duration-500 transform ${
          notification.type === 'success' 
            ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
            : 'bg-red-500/90 text-white border-red-400/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-300' : 'bg-red-300'}`}></div>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Meeting Summarizer</h1>
              <p className="text-gray-600 mt-1">Transform meeting transcripts into actionable insights</p>
            </div>
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
              Powered by Groq
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Input Method Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Add Your Meeting Content</h2>
              
              {/* Tab Selection */}
              <div className="flex space-x-1 bg-gray-50 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                    activeTab === 'text'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Text Input
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                    activeTab === 'file'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  File Upload
                </button>
              </div>

              {/* Text Input Tab */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="Paste your meeting transcript here...

Example: 'Meeting started at 10 AM with John, Sarah, and Mike. Discussed Q4 budget planning, allocated $50k for marketing. Action items: John to prepare budget report by Friday, Sarah to contact vendors for quotes.'"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                    <button
                      onClick={openTextModal}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                      title="Open in full screen editor"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {transcript.length} characters
                  </div>
                </div>
              )}

              {/* File Upload Tab */}
              {activeTab === 'file' && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600">Processing file...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{uploadedFile.name}</p>
                        <p className="text-gray-500 text-sm">File processed successfully</p>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setTranscript('');
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                      >
                        Upload different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">Drop files here or click to browse</p>
                        <p className="text-gray-500 text-sm">Supports TXT, PDF, and DOCX files</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.02] ring-1 ring-blue-500/20"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary Instructions */}
            <div className="bg-gradient-to-br from-white/60 via-purple-50/40 to-pink-50/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-purple-500/10 border border-purple-200/30 hover:shadow-3xl hover:shadow-purple-500/15 transition-all duration-500 hover:scale-[1.01] group">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Summary Instructions</h2>
              
              {/* Quick Presets */}
              <div className="mb-6 sm:mb-8">
                <p className="text-slate-600 text-sm font-medium mb-4">Quick presets:</p>
                <div className="flex flex-wrap gap-2 sm:gap-3 p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-inner">
                  {[
                    'Executive summary with key decisions',
                    'Action items and next steps',
                    'Meeting highlights and outcomes',
                    'Detailed analysis with recommendations'
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCustomPrompt(preset)}
                      className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-white/90 to-purple-50/80 hover:from-purple-100/90 hover:to-pink-100/80 text-purple-800 hover:text-purple-900 rounded-xl text-sm font-semibold transition-all duration-300 touch-manipulation shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/15 hover:scale-[1.02] border border-purple-200/50 hover:border-purple-300/60"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="w-full h-24 sm:h-28 lg:h-32 p-4 sm:p-5 border border-purple-200/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-purple-900 placeholder-purple-400 transition-all text-sm sm:text-base bg-gradient-to-br from-white/50 to-purple-50/50 backdrop-blur-sm shadow-inner"
                placeholder="Describe how you want the summary formatted...

Examples:
• 'Create an executive summary with key decisions and financial impacts'
• 'List all action items with owners and deadlines'
• 'Provide detailed analysis with strategic recommendations'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading || !transcript.trim() || !customPrompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-3.5 px-8 sm:px-10 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation w-full sm:w-auto shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.02] disabled:hover:scale-100 ring-1 ring-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Generating Summary...</span>
                  </>
                ) : (
                  <span>Generate Summary</span>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4 sm:space-y-6">
            {generatedSummary ? (
              <>
                {/* Generated Summary */}
                <div className="bg-gradient-to-br from-white/60 via-emerald-50/40 to-green-50/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 border border-emerald-200/30 hover:shadow-3xl hover:shadow-emerald-500/15 transition-all duration-500 hover:scale-[1.01] group">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">AI Summary</h2>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/25">
                      Ready to edit
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full h-60 sm:h-72 lg:h-80 p-4 sm:p-5 border border-emerald-200/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-emerald-900 placeholder-emerald-400 transition-all text-sm sm:text-base bg-gradient-to-br from-white/50 to-emerald-50/50 backdrop-blur-sm shadow-inner"
                      placeholder="Your AI-generated summary will appear here..."
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                    />
                    <button
                      onClick={openSummaryModal}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                      title="Open in full screen editor"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-3">Edit the summary above before sharing</p>
                </div>

                {/* Share Section */}
                <div className="bg-gradient-to-br from-white/60 via-teal-50/40 to-emerald-50/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-500/10 border border-teal-200/30 hover:shadow-3xl hover:shadow-teal-500/15 transition-all duration-500 hover:scale-[1.01] group">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Share Summary</h2>
                  <div className="space-y-4">
                    {/* Email Tags Display */}
                    {emails.length > 0 && (
                      <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-teal-100/50 to-emerald-100/50 backdrop-blur-sm rounded-2xl border border-teal-200/50 shadow-inner">
                        {emails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300"
                          >
                            <span>{email}</span>
                            <button
                              onClick={() => removeEmail(email)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Email Input */}
                    <div className="flex gap-2">
                      <input
                        type="email"
                        className="flex-1 p-4 sm:p-5 border border-teal-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-teal-900 placeholder-teal-400 transition-all text-sm sm:text-base bg-gradient-to-br from-white/50 to-teal-50/50 backdrop-blur-sm shadow-inner"
                        placeholder="Type email address and press Enter..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyPress={handleEmailKeyPress}
                      />
                      <button
                        onClick={addEmail}
                        disabled={!emailInput.trim()}
                        className="px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/35 hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        Add
                      </button>
                    </div>
                    <button
                      onClick={handleShareSummary}
                      disabled={isSharing || emails.length === 0}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:scale-[1.02] disabled:hover:scale-100 ring-1 ring-emerald-500/20"
                    >
                      {isSharing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Share via Email</span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-gray-300/50 ring-1 ring-gray-200/80 shadow-lg shadow-gray-500/5 hover:shadow-xl hover:shadow-gray-500/10 transition-all duration-300">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Generate</h3>
                <p className="text-gray-500">
                  Add your meeting content and instructions, then generate an AI-powered summary.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Input Modal */}
      {isTextModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Meeting Transcript</h3>
              <button
                onClick={closeTextModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 sm:p-6">
              <textarea
                className="w-full h-64 sm:h-80 lg:h-96 p-3 sm:p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                placeholder="Paste your meeting transcript here..."
                value={tempTranscript}
                onChange={(e) => setTempTranscript(e.target.value)}
              />
              <div className="text-xs sm:text-sm text-gray-500 mt-3">
                {tempTranscript.length} characters
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={closeTextModal}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 transition-all duration-300 text-sm sm:text-base touch-manipulation w-full sm:w-auto font-medium hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveTextModal}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 text-sm sm:text-base touch-manipulation w-full sm:w-auto font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.02] ring-1 ring-blue-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Edit AI Summary</h3>
              <button
                onClick={closeSummaryModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 sm:p-6">
              <textarea
                className="w-full h-64 sm:h-80 lg:h-96 p-3 sm:p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                placeholder="Your AI-generated summary will appear here..."
                value={tempSummary}
                onChange={(e) => setTempSummary(e.target.value)}
              />
              <div className="text-xs sm:text-sm text-gray-500 mt-3">
                {tempSummary.length} characters
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={closeSummaryModal}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 transition-all duration-300 text-sm sm:text-base touch-manipulation w-full sm:w-auto font-medium hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveSummaryModal}
                className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all duration-300 text-sm sm:text-base touch-manipulation w-full sm:w-auto font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:scale-[1.02] ring-1 ring-emerald-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-blue-200/30 bg-gradient-to-r from-blue-50/60 via-purple-50/50 to-pink-50/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-sm text-slate-700">
            Built by <span className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Manya</span>
          </div>
        </div>
      </div>
    </div>
  );
}
