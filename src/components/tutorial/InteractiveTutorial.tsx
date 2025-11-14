import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, Check, Lightbulb } from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';
import { useGamification } from '@/contexts/GamificationContext';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  showFor?: ('minimal' | 'moderate' | 'complete')[];
}

interface InteractiveTutorialProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
}

export function InteractiveTutorial({ tutorialId, steps, onComplete }: InteractiveTutorialProps) {
  const { preferences } = useGamification();
  const {
    isActive,
    currentStepIndex,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    filterSteps,
  } = useTutorial(tutorialId);

  const filteredSteps = filterSteps(steps);
  const currentStep = filteredSteps[currentStepIndex];
  const isLastStep = currentStepIndex === filteredSteps.length - 1;
  const progress = ((currentStepIndex + 1) / filteredSteps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
      onComplete?.();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    skipTutorial();
    onComplete?.();
  };

  if (!isActive || !currentStep) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-md w-full mx-4"
        >
          <Card className="border-2 border-primary shadow-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    Étape {currentStepIndex + 1} sur {filteredSteps.length}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">
                {currentStep.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>

              {currentStep.action && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    💡 Action : {currentStep.action}
                  </p>
                </div>
              )}

              {/* Gamification level indicator */}
              {preferences.level !== 'complete' && (
                <div className="text-xs text-muted-foreground italic">
                  Tutoriel adapté à votre niveau : {
                    preferences.level === 'minimal' ? 'Minimal' :
                    preferences.level === 'moderate' ? 'Modéré' : 'Complet'
                  }
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStepIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              {isLastStep ? (
                <Button onClick={handleNext} className="gap-2">
                  Terminer
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
