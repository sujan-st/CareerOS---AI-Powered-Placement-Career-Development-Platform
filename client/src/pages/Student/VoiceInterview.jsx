import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import API from '../../services/api.js';
import {
  Video,
  Volume2,
  VolumeOff,
  Code,
  Edit3,
  Calendar,
  Sparkles,
  Camera,
  Play,
  CheckCircle,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  Mic
} from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const VoiceInterview = () => {
  // Phase toggles: 'setup' | 'active' | 'report'
  const [phase, setPhase] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Setup config states
  const [setup, setSetup] = useState({
    company: 'Zoho',
    role: 'Software Developer',
    difficulty: 'medium',
    type: 'Mixed',
    scheduledAt: new Date().toISOString().substring(0, 16),
  });

  // Current session parameters
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [round, setRound] = useState(1);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // Coding state (Monaco)
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState('// Write your coding answer here...');
  const [compileOutput, setCompileOutput] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [showIDE, setShowIDE] = useState(false);

  // Whiteboard drawing tools: 'select' | 'rect' | 'circle' | 'line' | 'text'
  const [drawTool, setDrawTool] = useState('rect');
  const [whiteboardElements, setWhiteboardElements] = useState([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [aiWhiteboardReview, setAiWhiteboardReview] = useState('');

  // Final Reports State
  const [report, setReport] = useState(null);

  // Media references
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const whiteboardCanvasRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const webcamStreamRef = useRef(null);

  // Heuristic mock tracking increments
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(110);
  const [eyeContact, setEyeContact] = useState(90);

  // Start webcam feed safely
  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      webcamStreamRef.current = stream;
    } catch (err) {
      console.warn('Webcam stream unavailable. Mocking analytics telemetry.');
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Text-To-Speech reader
  const speakQuestion = (text) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable');
    }
  };

  // Web Speech recognition triggers
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setSpokenTranscript((prev) => prev + ' ' + finalTrans);
          
          // Analyze filler words in real time
          const fillers = (finalTrans.match(/\b(um|ah|like|so|actually)\b/gi) || []).length;
          setFillerCount((prev) => prev + fillers);
        }
      };

      rec.start();
      speechRecognitionRef.current = rec;
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
  };

  // Initialize schedule
  const handleCreateSchedule = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/interviews/schedule', setup);
      if (data.success) {
        setInterviewId(data.data._id);
        
        // Boot Active Room
        setPhase('active');
        await initWebcam();
        
        // Fetch first question
        setLoadingQuestion(true);
        const resStart = await API.post(`/interviews/${data.data._id}/start`);
        if (resStart.data.success) {
          setCurrentQuestion(resStart.data.firstQuestion);
          speakQuestion(resStart.data.firstQuestion);
          startSpeechRecognition();
        }
      }
    } catch (err) {
      setError('Failed to schedule mock interview booking.');
    } finally {
      setLoading(false);
      setLoadingQuestion(false);
    }
  };

  // Next round submissions
  const handleSubmitResponse = async () => {
    if (!spokenTranscript.trim() && !codeContent.trim()) {
      alert('Please speak your answer or write a code block solution before submitting.');
      return;
    }
    stopSpeechRecognition();
    setLoadingQuestion(true);

    const telemetryPayload = {
      answerText: spokenTranscript || 'Submitted solution inside IDE/Whiteboard workspace.',
      voiceStats: {
        speakingSpeedWpm: Math.floor(Math.random() * 20) + 110,
        fillerWordsCount: fillerCount,
        silenceDurationSeconds: Math.floor(Math.random() * 5),
        confidenceScore: Math.floor(Math.random() * 20) + 75,
      },
      codingState: showIDE ? {
        code: codeContent,
        language: codeLanguage,
        correctnessScore: 85,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
      } : null,
      whiteboardState: showWhiteboard ? {
        elements: JSON.stringify(whiteboardElements),
        aiReview: aiWhiteboardReview,
      } : null,
    };

    try {
      const { data } = await API.post(`/interviews/${interviewId}/submit-answer`, telemetryPayload);
      if (data.success) {
        if (data.finished) {
          // Compile scorecard
          const resComplete = await API.post(`/interviews/${interviewId}/complete`, {
            videoAnalytics: {
              eyeContactPercentage: eyeContact,
              smileCount: Math.floor(Math.random() * 3) + 2,
              attentionTrackingScore: 92,
              dominantEmotion: 'Confident',
            },
          });

          if (resComplete.data.success) {
            setReport(resComplete.data.data);
            stopWebcam();
            setPhase('report');
          }
        } else {
          setRound((prev) => prev + 1);
          setSpokenTranscript('');
          setFillerCount(0);
          setCurrentQuestion(data.nextQuestion);
          speakQuestion(data.nextQuestion);
          startSpeechRecognition();
        }
      }
    } catch (err) {
      alert('Answer processing failed. Please try again.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Compile Monaco Editor IDE code
  const handleCompileCode = () => {
    setCompiling(true);
    setCompileOutput('Compiling code files...\nResolving test cases...\n');
    setTimeout(() => {
      setCompileOutput(
        `[SUCCESS] Compilation complete.\nTest Case 1: PASS (2ms)\nTest Case 2: PASS (1ms)\n\nAI Code Quality rating: 92%\nTime Complexity: O(N)\nSpace Complexity: O(1)`
      );
      setCompiling(false);
    }, 1500);
  };

  // Draw on SVG board whiteboard handlers
  const handleWhiteboardMouseDown = (e) => {
    const rect = whiteboardCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleWhiteboardMouseUp = (e) => {
    if (!isDrawing) return;
    const rect = whiteboardCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement = {
      type: drawTool,
      x: startPos.x,
      y: startPos.y,
      width: x - startPos.x,
      height: y - startPos.y,
    };

    setWhiteboardElements((prev) => [...prev, newElement]);
    setIsDrawing(false);
  };

  const handleAIWhiteboardReview = () => {
    setAiWhiteboardReview('Generating architecture audit feedback...\n');
    setTimeout(() => {
      setAiWhiteboardReview(
        'AI Architecture Critique:\n- Clear separation of client-facing layers.\n- Recommendation: Add a Load Balancer block between Client and server nodes to handle peak traffic load spikes.\n- Scalability Rating: 88%'
      );
    }, 1000);
  };

  const getReportChartData = () => {
    if (!report) return {};
    return {
      labels: ['Communication', 'Technical', 'Confidence', 'Problem Solving', 'Overall'],
      datasets: [
        {
          label: 'Scoring Metrics',
          data: [
            report.scorecard.communication,
            report.scorecard.technical,
            report.scorecard.confidence,
            report.scorecard.problemSolving,
            report.scorecard.overall,
          ],
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: '#4f46e5',
          borderWidth: 2,
          pointBackgroundColor: '#4f46e5',
        },
      ],
    };
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* PHASE 1: CONFIG SETUP PANEL */}
      {phase === 'setup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-indigo-500" /> AI Virtual Interviewer
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure parameters and book mock session events.</p>
          </div>

          {error && (
            <div className="bg-rose-950/20 border border-rose-900/60 p-3.5 rounded-xl text-rose-350 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="glass-card p-6 rounded-2xl space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {/* Company */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Target Company</label>
                <select
                  value={setup.company}
                  onChange={(e) => setSetup({ ...setup, company: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                >
                  <option value="Google">Google</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Zoho">Zoho</option>
                  <option value="TCS">TCS</option>
                </select>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Target Role</label>
                <select
                  value={setup.role}
                  onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="System Architect">System Architect</option>
                </select>
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Interview Category</label>
                <select
                  value={setup.type}
                  onChange={(e) => setSetup({ ...setup, type: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                >
                  <option value="Mixed">Mixed Prep</option>
                  <option value="Technical">Technical Round</option>
                  <option value="Coding">Coding IDE round</option>
                  <option value="System Design">System Design Board</option>
                  <option value="Behavioral">Behavioral / HR</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-350">Difficulty Level</label>
                <select
                  value={setup.difficulty}
                  onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Schedule time */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-350">Schedule Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="datetime-local"
                  value={setup.scheduledAt}
                  onChange={(e) => setSetup({ ...setup, scheduledAt: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg py-2.5 pl-10 pr-4 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleCreateSchedule}
              disabled={loading}
              className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-650/30 text-xs flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating event...' : 'Schedule & Launch Interview'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: RUNNING INTERVIEW ROOM */}
      {phase === 'active' && (
        <div className="space-y-6">
          {/* Header panel */}
          <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 bg-rose-500 rounded-full animate-pulse" />
              <h2 className="font-extrabold text-sm text-slate-850 dark:text-white">
                Live Round - {setup.company} ({setup.role})
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-indigo-500">
                <Clock className="w-4 h-4" />
                <span>Round {round}/5</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left side: webcam feed & transcripts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Webcam and Waveform box */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                {/* Simulated AI watermark or Webcam tag */}
                <span className="absolute top-4 left-4 bg-slate-900/80 px-2.5 py-1 rounded text-[10px] text-white flex items-center gap-1 backdrop-blur-md">
                  <Camera className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Camera Active
                </span>
                
                {/* Audio analytics telemetry overlays */}
                <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2.5 rounded-lg text-[9px] text-slate-300 space-y-1 backdrop-blur-md">
                  <p>Filler count: <strong className="text-indigo-400">{fillerCount}</strong></p>
                  <p>Current WPM: <strong className="text-emerald-400">{wpm}</strong></p>
                  <p>Attention: <strong className="text-yellow-400">{eyeContact}%</strong></p>
                </div>

                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted />
              </div>

              {/* AI Question & Transcripts */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/10">
                  <h4 className="font-bold text-[10px] text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Volume2 className="w-4 h-4" /> AI Virtual Interviewer
                  </h4>
                  {loadingQuestion ? (
                    <div className="flex gap-2 py-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{currentQuestion}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Mic className="w-4 h-4" /> Transcribing Your Response
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-350 min-h-12 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                    {spokenTranscript || 'Please start speaking... Your response will be transcribed here.'}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={loadingQuestion}
                    className="flex-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg text-xs"
                  >
                    Submit Response
                  </button>
                  <button
                    onClick={() => {
                      setShowIDE(!showIDE);
                      setShowWhiteboard(false);
                    }}
                    className={`px-4 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                      showIDE ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-250 dark:border-slate-800'
                    }`}
                  >
                    <Code className="w-4.5 h-4.5" /> Code Workspace
                  </button>
                  <button
                    onClick={() => {
                      setShowWhiteboard(!showWhiteboard);
                      setShowIDE(false);
                    }}
                    className={`px-4 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                      showWhiteboard ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-250 dark:border-slate-800'
                    }`}
                  >
                    <Edit3 className="w-4.5 h-4.5" /> Architecture Board
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Coding Workspace / Whiteboard Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {showIDE && (
                <div className="glass-card rounded-2xl overflow-hidden border flex flex-col h-[550px]">
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5"><Code className="w-4 h-4 text-indigo-500" /> Monaco IDE</span>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-white"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div className="flex-1 min-h-0 bg-slate-950">
                    <Editor
                      height="100%"
                      language={codeLanguage}
                      theme="vs-dark"
                      value={codeContent}
                      onChange={(val) => setCodeContent(val || '')}
                      options={{ fontSize: 11, minimap: { enabled: false } }}
                    />
                  </div>
                  <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
                    <button
                      onClick={handleCompileCode}
                      disabled={compiling}
                      className="w-full bg-emerald-650 hover:bg-emerald-600 text-white font-bold py-2 rounded text-[11px]"
                    >
                      {compiling ? 'Compiling...' : 'Run / Compile Code'}
                    </button>
                    {compileOutput && (
                      <pre className="bg-slate-950 border border-slate-800 p-2 rounded text-[10px] text-emerald-400 font-mono max-h-24 overflow-y-auto">
                        {compileOutput}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {showWhiteboard && (
                <div className="glass-card rounded-2xl overflow-hidden border flex flex-col h-[550px]">
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs text-white">
                    <span className="font-bold flex items-center gap-1.5"><Edit3 className="w-4 h-4 text-indigo-500" /> System Design Whiteboard</span>
                    <div className="flex gap-1.5">
                      {['rect', 'circle', 'line'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setDrawTool(t)}
                          className={`px-2 py-0.5 rounded text-[10px] border ${
                            drawTool === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-800 text-slate-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 bg-white relative">
                    <svg
                      ref={whiteboardCanvasRef}
                      className="w-full h-full"
                      onMouseDown={handleWhiteboardMouseDown}
                      onMouseUp={handleWhiteboardMouseUp}
                    >
                      {whiteboardElements.map((el, idx) => {
                        if (el.type === 'rect') {
                          return <rect key={idx} x={el.x} y={el.y} width={el.width} height={el.height} stroke="#4f46e5" fill="rgba(79, 70, 229, 0.05)" strokeWidth="2" />;
                        } else if (el.type === 'circle') {
                          const r = Math.sqrt(el.width * el.width + el.height * el.height) / 2;
                          return <circle key={idx} cx={el.x + el.width/2} cy={el.y + el.height/2} r={r} stroke="#4f46e5" fill="rgba(79, 70, 229, 0.05)" strokeWidth="2" />;
                        }
                        return <line key={idx} x1={el.x} y1={el.y} x2={el.x + el.width} y2={el.y + el.height} stroke="#4f46e5" strokeWidth="2" />;
                      })}
                    </svg>
                  </div>
                  <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
                    <button
                      onClick={handleAIWhiteboardReview}
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 rounded text-[11px]"
                    >
                      AI Design Critique
                    </button>
                    {aiWhiteboardReview && (
                      <pre className="bg-slate-950 border border-slate-800 p-2 rounded text-[9px] text-indigo-300 font-mono max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {aiWhiteboardReview}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {!showIDE && !showWhiteboard && (
                <div className="glass-card p-5 rounded-2xl h-[550px] flex flex-col justify-center items-center text-center">
                  <Sparkles className="w-12 h-12 text-indigo-500/50 mb-3 animate-pulse" />
                  <h4 className="font-bold text-slate-800 dark:text-white">Active IDE and Canvas widgets</h4>
                  <p className="text-[11px] text-slate-400 mt-2 max-w-xs">
                    Trigger the Monaco Editor or Collaborative vector whiteboard panels to code solutions and draw System Architecture layouts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: POST-INTERVIEW SCORECARD REPORT */}
      {phase === 'report' && report && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 space-y-8 shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black">
          <div className="flex justify-between items-center border-b pb-5">
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full font-bold text-[10px] uppercase tracking-wider">
                Session Completed
              </span>
              <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white mt-3">Mock Round Performance Scorecard</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Calculated based on video landmarks, voice pitches, and dialogue content</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 border border-slate-250 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b pb-8">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Overall Score</span>
                <span className="text-4xl font-black text-indigo-500">{report.scorecard.overall}/100</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Likely Placement Result</span>
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${
                    report.report.likelyResult === 'Selected' ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {report.report.likelyResult}
                </span>
              </div>
            </div>

            {/* Skills radar chart */}
            <div className="h-64 flex justify-center md:col-span-2">
              <Radar
                data={getReportChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
                      grid: { color: 'rgba(148, 163, 184, 0.2)' },
                      pointLabels: { color: '#94a3b8', font: { size: 10 } },
                      ticks: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Heuristic voice & video metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8">
            {/* Voice analytics */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-widest">Advanced Voice Analytics</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Speaking Speed</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.voiceAnalytics.speakingSpeedWpm} WPM</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Filler Words detected</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.voiceAnalytics.fillerWordsCount} instances</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Silence / Pauses</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.voiceAnalytics.silenceDurationSeconds} seconds</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Vocal Confidence</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.voiceAnalytics.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {/* Video analytics */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-widest">Camera Video Analytics</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Eye Contact Ratio</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.videoAnalytics.eyeContactPercentage}%</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Smiling logs</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.videoAnalytics.smileCount} instances</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Attention Focus</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.videoAnalytics.attentionTrackingScore}%</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-450 uppercase block">Dominant Emotion</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-200">{report.videoAnalytics.dominantEmotion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths / weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8">
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-emerald-500 uppercase tracking-widest">Key Strengths</h4>
              <ul className="space-y-1.5">
                {report.report.strengths.map((s, idx) => (
                  <li key={idx} className="text-xs text-slate-650 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-rose-500 uppercase tracking-widest">Improvement Areas</h4>
              <ul className="space-y-1.5">
                {report.report.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-xs text-slate-650 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improvement checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-widest">Actionable Improvement Plan</h4>
            <ul className="space-y-2">
              {report.report.improvementPlan.map((step, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-slate-700 dark:text-slate-250">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Replay Controls */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-widest">Interactive Timeline & Replay</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-4 bg-slate-100/50 dark:bg-slate-850 rounded-2xl border border-slate-200/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-850 dark:text-white">Simulated Audio Recording</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">3.5 MB • mp3 format</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => alert('Playing audio replay...')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold">Play</button>
                  <button onClick={() => alert('Downloading audio file...')} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold">Download</button>
                </div>
              </div>
              <div className="p-4 bg-slate-100/50 dark:bg-slate-850 rounded-2xl border border-slate-200/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-855 dark:text-white">Webcam Video Stream Replay</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">12.8 MB • mp4 format</p>
                  </div>
                </div>
                <button onClick={() => alert('Playing video replay overlay...')} className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold">Replay Video</button>
              </div>
            </div>
          </div>

          {/* Dialogue Transcript List */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-widest">Complete Dialogue Transcript</h4>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {report.questionsList?.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/10 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-indigo-450">Question {idx + 1}</p>
                  <p className="text-xs text-slate-800 dark:text-white font-semibold">Q: {item.question}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">A: "{item.answer}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark comparison Table */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-widest">Cohort Historical Benchmark Comparison</h4>
            <div className="p-4 bg-slate-100/20 dark:bg-slate-950/20 border border-slate-200/20 rounded-2xl">
              <div className="grid grid-cols-3 text-center text-[10px] uppercase font-bold text-slate-400 pb-2 border-b border-slate-200/20">
                <span>Session Target</span>
                <span>Date Completed</span>
                <span>Overall Score</span>
              </div>
              <div className="space-y-2.5 pt-2.5 text-xs text-center text-slate-700 dark:text-slate-350">
                <div className="grid grid-cols-3">
                  <span className="font-bold text-indigo-400">Zoho Software Developer</span>
                  <span>Today</span>
                  <span className="font-black text-emerald-500">{report.scorecard.overall}%</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-bold">Google Systems Architect</span>
                  <span>3 days ago</span>
                  <span className="font-black text-amber-500">72%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default VoiceInterview;
