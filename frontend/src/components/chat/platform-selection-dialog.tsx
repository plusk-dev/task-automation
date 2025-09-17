import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const platforms: any[] = [];

interface PlatformSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAction: (actionType: string, actionName: string, defaultData: Record<string, any>) => void;
}

export function PlatformSelectionDialog({ open, onOpenChange, onSelectAction }: PlatformSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platforms[0] | null>(null);
  const [direction, setDirection] = useState(0);

  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlatformSelect = (platform: typeof platforms[0]) => {
    setDirection(1);
    setSelectedPlatform(platform);
    setSearchQuery("");
  };

  const handleBack = () => {
    setDirection(0);
    setSelectedPlatform(null);
    setSearchQuery("");
  };

  const handleActionSelect = (actionType: string, actionName: string, defaultData: Record<string, any>) => {
    onSelectAction(actionType, actionName, defaultData);
    onOpenChange(false);
    setSelectedPlatform(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedPlatform
              ? `Select action in ${selectedPlatform.name}`
              : "Select Platform"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedPlatform && (
              <motion.div
                key="back-button"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.05 }}
              >
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to platforms
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!selectedPlatform && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {selectedPlatform ? (
                <motion.div
                  key="actions"
                  initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 2000, 
                    damping: 100,
                    duration: 0.05
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {selectedPlatform.icon ? (
                      <img src={selectedPlatform.icon} alt={selectedPlatform.name} className="w-8 h-8 rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <span className="text-sm font-medium">{selectedPlatform.name[0]}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{selectedPlatform.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedPlatform.actions.length} action{selectedPlatform.actions.length !== 1 ? 's' : ''} available
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedPlatform.actions.map((action) => (
                        <button
                          key={action.type}
                          onClick={() => handleActionSelect(action.type, action.name, action.defaultData)}
                          className="w-full text-left p-3 rounded border hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="text-sm font-medium">{action.name}</div>
                          <div className="text-xs text-muted-foreground">{action.type}</div>
                        </button>
                      ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="platforms"
                  initial={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25,
                    duration: 0.05
                  }}
                  className="space-y-2"
                >
                  {filteredPlatforms.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => handlePlatformSelect(platform)}
                      className="w-full text-left p-3 rounded border hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {platform.icon ? (
                          <img src={platform.icon} alt={platform.name} className="w-8 h-8 rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <span className="text-sm font-medium">{platform.name[0]}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {platform.actions.length} action{platform.actions.length !== 1 ? 's' : ''} available
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 