import { ChatMessage, Step } from "./message-list";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageProps {
  message: ChatMessage;
}

const LoadingAnimation = () => {
  return (
    <motion.div 
      className="flex items-center justify-center py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <motion.div 
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.8, 0.4, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-6 h-6 bg-primary/60 rounded-full"></div>
          </motion.div>
        </div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">Processing your request...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ThreeDotsLoader = () => {
  return (
    <motion.div 
      className="flex items-center space-x-1 py-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <motion.span 
        className="text-xs text-muted-foreground ml-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Processing...
      </motion.span>
    </motion.div>
  );
};

const CompletionIndicator = ({ isAnimatingOut }: { isAnimatingOut: boolean }) => {
  return (
    <motion.div 
      className="flex items-center space-x-2 py-2"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ 
        opacity: isAnimatingOut ? 0 : 1, 
        y: isAnimatingOut ? -10 : 0,
        scale: isAnimatingOut ? 0.95 : 1 
      }}
      transition={{ 
        duration: isAnimatingOut ? 0.4 : 0.6,
        ease: isAnimatingOut ? "easeIn" : "easeOut"
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
      </motion.div>
      <motion.span 
        className="text-xs text-green-600 font-medium"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Done
      </motion.span>
    </motion.div>
  );
};

const renderMarkdown = (text: string) => {
  if (!text) return text;
  
  let formatted = text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
  
  formatted = formatted.replace(/(<li>.*?<\/li>(?:<br><li>.*?<\/li>)*)/g, '<ul>$1</ul>');
  formatted = formatted.replace(/<ul>(.*?)<\/ul>/g, (match, content) => {
    return '<ul>' + content.replace(/<br>/g, '') + '</ul>';
  });
  
  return formatted;
};

const getActionIcon = (integration_uuid: string) => {
  try {
    const integrationConnections = JSON.parse(localStorage.getItem('integrationConnections') || '[]');
    const connection = integrationConnections.find((conn: any) => 
      conn.integration.uuid === integration_uuid
    );
    
    if (connection && connection.integration.icon) {
      return connection.integration.icon;
    }
  } catch (error) {
    console.error('Error getting icon from localStorage:', error);
  }
  
  return null;
};

const getIntegrationName = (integration_uuid: string) => {
  try {
    const integrationConnections = JSON.parse(localStorage.getItem('integrationConnections') || '[]');
    const connection = integrationConnections.find((conn: any) => 
      conn.integration.uuid === integration_uuid
    );
    
    if (connection && connection.integration.name) {
      return connection.integration.name;
    }
  } catch (error) {
    console.error('Error getting integration name from localStorage:', error);
  }
  
  return null;
};

const MarkdownContent = ({ content }: { content: string }) => {
  const htmlContent = renderMarkdown(content);
  
  return (
    <div 
      className="markdown-content prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        lineHeight: '1.6',
      }}
    />
  );
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'running':
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

interface StepItemProps {
  step: Step;
  index: number;
}

function StepItem({ step, index }: StepItemProps) {
  return (
    <motion.div 
      className="mb-2"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        delay: (step.animationDelay || index * 100) / 1000
      }}
    >
      <AccordionItem value={step.id} className="border rounded-lg hover:bg-primary/10">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: ((step.animationDelay || index * 100) / 1000) + 0.1
                }}
              >
                {getStatusIcon(step.status)}
              </motion.div>
              {step.integration_uuid && getActionIcon(step.integration_uuid) ? (
                <motion.div 
                  className="w-6 h-6 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: ((step.animationDelay || index * 100) / 1000) + 0.2
                  }}
                >
                  <img 
                    src={getActionIcon(step.integration_uuid)!} 
                    alt="integration icon"
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="text-xs font-semibold text-primary hidden w-6 h-6 rounded bg-muted flex items-center justify-center">
                    {getIntegrationName(step.integration_uuid)?.charAt(0).toUpperCase() || '?'}
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  className="w-6 h-6 rounded bg-muted flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: ((step.animationDelay || index * 100) / 1000) + 0.2
                  }}
                >
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              className="flex-1 text-left"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4,
                delay: ((step.animationDelay || index * 100) / 1000) + 0.3
              }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {step.actions && step.actions.length > 0 ? (
                    <p className="text-sm font-medium">{step.actions[0].type}</p>
                  ) : step.title ? (
                    <p className="text-sm font-medium">
                      {step.title.replace(/^Step \d+:\s*/, '')}
                    </p>
                  ) : (
                    <p className="text-sm font-medium">Processing...</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-3">
            <div className="text-sm">
              <div className="bg-muted/50 rounded p-3">
                <MarkdownContent content={step.content} />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  );
}

export function Message({ message }: MessageProps) {
  const isUser = message.sender === "user";
  const steps = message.steps || [];
  const isLoading = message.isLoading || false;
  const [showCompletion, setShowCompletion] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && steps.length > 0) {
      setShowCompletion(true);
      setIsAnimatingOut(false);
      
      const fadeOutTimer = setTimeout(() => {
        setIsAnimatingOut(true);
      }, 2500);
      
      const hideTimer = setTimeout(() => {
        setShowCompletion(false);
        setIsAnimatingOut(false);
      }, 3000);
      
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isLoading, steps.length]);

  return (
    <motion.div 
      className="w-full border-border/50 pb-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
          <p className="text-sm font-medium mb-1">
          </p>
          
          {isUser && (
            <motion.div 
              className="text-base text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <MarkdownContent content={message.content} />
            </motion.div>
          )}
          
          <AnimatePresence>
            {!isUser && isLoading && steps.length === 0 && (
              <motion.div
                key="initial-loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <LoadingAnimation />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!isUser && steps.length > 0 && (
              <motion.div 
                key="steps-section"
                className="mt-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.p 
                  className="text-sm font-medium text-foreground mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  Execution Steps ({steps.length})
                </motion.p>
                <Accordion type="multiple" className="space-y-0">
                  {steps.map((step, index) => (
                    <StepItem
                      key={step.id}
                      step={step}
                      index={index}
                    />
                  ))}
                </Accordion>
                
                <AnimatePresence mode="wait">
                  {isLoading && (
                    <motion.div 
                      key="loader"
                      className="mt-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ThreeDotsLoader />
                    </motion.div>
                  )}
                  
                  {!isLoading && showCompletion && (
                    <motion.div 
                      key="completion"
                      className="mt-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CompletionIndicator isAnimatingOut={isAnimatingOut} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isUser && !isLoading && steps.length > 0 && message.content && message.content !== "Processing your request..." && !message.content.match(/^Step \d+ of \d+/) && !message.content.includes("Processing your request with") && (
              <motion.div 
                key="final-response"
                className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              >
                <motion.div 
                  className="flex items-center gap-2 mb-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Final Result</span>
                </motion.div>
                <motion.div 
                  className="text-base"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <MarkdownContent content={message.content} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
} 