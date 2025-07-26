import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Camera, Rocket, RotateCcw, AlertTriangle, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CosmicBackground from "@/components/cosmic-background";
import LoadingSpinner from "@/components/loading-spinner";
import { useApod } from "@/hooks/use-apod";

export default function Home() {
  const [randomDate, setRandomDate] = useState<string | null>(null);
  const [birthdayDate, setBirthdayDate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: apodData, isLoading, error, refetch } = useApod(randomDate);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRandomDate = () => {
    const start = new Date('1995-06-16'); // APOD started June 16, 1995
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const randomDate = new Date(randomTime);
    return randomDate.toISOString().split('T')[0];
  };

  const handleRandomImage = () => {
    const newRandomDate = getRandomDate();
    setRandomDate(newRandomDate);
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['apod'] });
  };

  const handleBirthdaySubmit = () => {
    if (birthdayDate) {
      // Validate date is not in the future and not before APOD started
      const inputDate = new Date(birthdayDate);
      const apodStart = new Date('1995-06-16');
      const today = new Date();
      
      if (inputDate < apodStart) {
        alert('NASA\'s APOD archive started on June 16, 1995. Please choose a date after that.');
        return;
      }
      
      if (inputDate > today) {
        alert('Cannot fetch images from the future! Please choose a past date.');
        return;
      }
      
      setRandomDate(birthdayDate);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['apod'] });
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--space-dark)] via-[var(--space-navy)] to-[var(--space-blue)] text-[var(--starlight)] overflow-x-hidden">
        <CosmicBackground />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--space-dark)] via-[var(--space-navy)] to-[var(--space-blue)] text-[var(--starlight)] overflow-x-hidden">
        <CosmicBackground />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-screen">
            <Alert className="bg-gradient-to-r from-red-900/20 to-[var(--solar-orange)]/20 border border-red-500/30 rounded-2xl p-6 animate-slide-up max-w-md">
              <AlertTriangle className="h-4 w-4 text-[var(--solar-orange)]" />
              <AlertDescription className="text-[var(--starlight)] mt-2">
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Unable to Connect to NASA</h3>
                  <p className="text-[var(--cosmic-gray)] text-sm">
                    The cosmic data stream is temporarily unavailable. Please try again in a moment.
                  </p>
                </div>
                <Button 
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-[var(--cosmic-purple)] to-[var(--stellar-blue)] hover:opacity-80 text-[var(--starlight)]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--space-dark)] via-[var(--space-navy)] to-[var(--space-blue)] text-[var(--starlight)] overflow-x-hidden font-inter">
      <CosmicBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light mb-4 bg-gradient-to-r from-[var(--starlight)] via-[var(--cosmic-purple)] to-[var(--stellar-blue)] bg-clip-text text-transparent">
            Cosmic Journal
          </h1>
          <p className="text-[var(--cosmic-gray)] text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            A daily window into the cosmos, featuring NASA's Astronomy Picture of the Day
          </p>
        </header>

        {/* Main Content */}
        <main className="animate-slide-up">
          {apodData && (
            <Card className="bg-gradient-to-br from-[var(--space-blue)]/30 to-[var(--cosmic-purple)]/10 backdrop-blur-sm border border-[var(--cosmic-purple)]/20 rounded-3xl shadow-2xl mb-8">
              <CardHeader className="pb-4">
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 leading-tight text-[var(--starlight)]">
                  {apodData.title}
                </h2>
                <div className="flex items-center space-x-4 text-[var(--cosmic-gray)]">
                  <span className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[var(--stellar-blue)]" />
                    <span>{formatDate(apodData.date)}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-[var(--cosmic-purple)]" />
                    <span>NASA/ESA</span>
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                {/* Media Container */}
                <div className="mb-6">
                  {apodData.media_type === 'image' ? (
                    <img 
                      src={apodData.url}
                      alt={apodData.title}
                      className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
                      <iframe 
                        src={apodData.url}
                        className="w-full h-full"
                        frameBorder="0" 
                        allowFullScreen
                        title={apodData.title}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-[var(--cosmic-gray)] leading-relaxed text-base md:text-lg">
                    {apodData.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleRandomImage}
                disabled={isLoading}
                className="bg-gradient-to-r from-[var(--cosmic-purple)] to-[var(--stellar-blue)] hover:from-[var(--cosmic-purple)]/80 hover:to-[var(--stellar-blue)]/80 text-[var(--starlight)] font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--cosmic-purple)]/50 shadow-lg text-base"
              >
                <RotateCcw className="w-5 h-5 mr-3" />
                Show Another Random Image
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[var(--solar-orange)] to-[var(--aurora-green)] hover:from-[var(--solar-orange)]/80 hover:to-[var(--aurora-green)]/80 text-[var(--starlight)] font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--solar-orange)]/50 shadow-lg text-base"
                  >
                    <Cake className="w-5 h-5 mr-3" />
                    Check NASA's Image on Your Birthday 🎂
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-[var(--space-dark)] to-[var(--space-navy)] backdrop-blur-sm border border-[var(--cosmic-purple)]/50 rounded-3xl text-[var(--starlight)] max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center mb-2 text-[var(--starlight)]">
                      🎂 Birthday Cosmic Journey
                    </DialogTitle>
                    <DialogDescription className="text-[var(--starlight)]/80 text-center text-sm leading-relaxed">
                      Discover what celestial wonder NASA featured on your special day!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 p-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[var(--starlight)]">
                        Enter your birthday:
                      </label>
                      <Input
                        type="date"
                        value={birthdayDate}
                        onChange={(e) => setBirthdayDate(e.target.value)}
                        min="1995-06-16"
                        max={new Date().toISOString().split('T')[0]}
                        className="bg-[var(--space-navy)] border border-[var(--cosmic-purple)]/50 rounded-xl text-[var(--starlight)] focus:ring-2 focus:ring-[var(--cosmic-purple)] focus:border-[var(--cosmic-purple)] placeholder:text-[var(--cosmic-gray)]"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => setIsDialogOpen(false)}
                        variant="outline"
                        className="flex-1 border-[var(--cosmic-gray)]/50 text-[var(--starlight)] hover:bg-[var(--space-navy)] hover:text-[var(--starlight)] rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBirthdaySubmit}
                        disabled={!birthdayDate}
                        className="flex-1 bg-gradient-to-r from-[var(--cosmic-purple)] to-[var(--stellar-blue)] hover:opacity-80 text-[var(--starlight)] rounded-xl"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Explore
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-[var(--cosmic-gray)]">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Rocket className="w-4 h-4 text-[var(--stellar-blue)]" />
            <span className="text-sm">Powered by NASA's Astronomy Picture of the Day API</span>
          </div>
          <p className="text-xs opacity-75">
            Images and content courtesy of NASA and the astronomical community
          </p>
        </footer>
      </div>
    </div>
  );
}
