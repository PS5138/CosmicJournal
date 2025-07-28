import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Camera, Rocket, RotateCcw, AlertTriangle, Cake, Clock, Share2, ExternalLink, Link } from "lucide-react";
import { FaTwitter, FaFacebook, FaLinkedin, FaReddit, FaPinterest } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CosmicBackground from "@/components/cosmic-background";
import LoadingSpinner from "@/components/loading-spinner";
import { useApod } from "@/hooks/use-apod";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
  const [randomDate, setRandomDate] = useState<string | null>(null);
  const [birthdayDate, setBirthdayDate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeSliderYear, setTimeSliderYear] = useState<number>(new Date().getFullYear());
  const [isTimeSliderActive, setIsTimeSliderActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDate, setPreviewDate] = useState<string>("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const generateRandomDateInYear = (year: number) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    
    // If it's 1995, start from June 16 when APOD began
    if (year === 1995) {
      startOfYear.setMonth(5, 16); // June 16
    }
    
    // If it's current year, end at today
    if (year === new Date().getFullYear()) {
      endOfYear.setTime(new Date().getTime());
    }
    
    const randomTime = startOfYear.getTime() + Math.random() * (endOfYear.getTime() - startOfYear.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  };
  
  // Determine which date to use based on active mode
  const getActiveDate = () => {
    if (isTimeSliderActive && !isDragging) {
      return generateRandomDateInYear(timeSliderYear);
    }
    return randomDate;
  };

  const currentDate = getActiveDate();
  const { data: apodData, isLoading, error, refetch } = useApod(currentDate);
  
  // Simple notification for "other" media type
  useEffect(() => {
    if (apodData && apodData.media_type === "other" && !apodData.extracted_from_page) {
      console.log('Detected "other" media type - use Force Fresh Video Data button for extraction');
    }
  }, [apodData]);

  // Debug logging
  useEffect(() => {
    if (apodData) {
      console.log('APOD Data:', {
        date: apodData.date,
        media_type: apodData.media_type,
        url: apodData.url,
        extracted: apodData.extracted_from_page
      });
    }
  }, [apodData]);



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
      
      // Track birthday lookup usage
      trackEvent('birthday_lookup', 'user_interaction', birthdayDate);
      
      setIsTimeSliderActive(false);
      setRandomDate(birthdayDate);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['apod'] });
    }
  };

  const handleTimeSliderChange = (value: number[]) => {
    const year = value[0];
    setTimeSliderYear(year);
    setIsDragging(true);
    
    // Generate a preview date for the bubble
    const previewDateStr = generateRandomDateInYear(year);
    setPreviewDate(previewDateStr);
  };

  const handleTimeSliderCommit = (value: number[]) => {
    const year = value[0];
    setTimeSliderYear(year);
    setIsTimeSliderActive(true);
    setRandomDate(null); // Clear other date modes
    setIsDragging(false);
    setPreviewDate("");
    
    // Track time travel usage
    trackEvent('time_travel', 'user_interaction', year.toString());
    
    queryClient.invalidateQueries({ queryKey: ['apod'] });
  };

  const handleRandomImage = () => {
    const newRandomDate = getRandomDate();
    setIsTimeSliderActive(false);
    setRandomDate(newRandomDate);
    
    // Track random image usage
    trackEvent('random_image', 'user_interaction', newRandomDate);
    
    queryClient.invalidateQueries({ queryKey: ['apod'] });
  };

  const handleTodayImage = () => {
    const today = new Date().toISOString().split('T')[0];
    setIsTimeSliderActive(false);
    setRandomDate(today);
    
    // Track today button usage
    trackEvent('today_view', 'user_interaction', today);
  };

  const handleForceRefresh = () => {
    console.log('Force refreshing today\'s data...');
    // Navigate to today and force fresh extraction
    setRandomDate('2025-07-28');
    setIsTimeSliderActive(false);
    queryClient.removeQueries({ queryKey: ['apod', '2025-07-28'] });
    
    // Use force parameter to bypass all caching and ensure extraction
    const forceUrl = `/api/apod?date=2025-07-28&force=${Date.now()}`;
    fetch(forceUrl, { cache: 'no-store' }).then(response => response.json()).then(data => {
      console.log('Force refresh result:', data);
      if (data.extracted_from_page) {
        // Update cache with fresh extracted data
        queryClient.setQueryData(['apod', '2025-07-28'], data);
      }
    });
  };

  const handleRetry = () => {
    refetch();
  };

  // Social media sharing functions
  const generateShareText = () => {
    if (!apodData) return "";
    return `🌌 ${apodData.title} - NASA's Astronomy Picture of the Day from ${formatDate(apodData.date)} 🚀\n\n${apodData.explanation.substring(0, 100)}...`;
  };

  const generateShareUrl = () => {
    return window.location.href;
  };

  const shareToTwitter = () => {
    trackEvent('share', 'social_media', 'twitter');
    const text = `🌌 ${apodData?.title} - NASA's APOD from ${formatDate(apodData?.date || "")} 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(generateShareUrl())}`;
    window.open(url, '_blank', 'width=550,height=450');
  };

  const shareToFacebook = () => {
    trackEvent('share', 'social_media', 'facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generateShareUrl())}&quote=${encodeURIComponent(generateShareText())}`;
    window.open(url, '_blank', 'width=550,height=450');
  };

  const shareToLinkedIn = () => {
    trackEvent('share', 'social_media', 'linkedin');
    const title = `${apodData?.title} - NASA APOD`;
    const summary = apodData?.explanation.substring(0, 200) + "...";
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(generateShareUrl())}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    window.open(url, '_blank', 'width=550,height=450');
  };

  const shareToReddit = () => {
    trackEvent('share', 'social_media', 'reddit');
    const title = `🌌 ${apodData?.title} - NASA's Astronomy Picture of the Day`;
    const url = `https://reddit.com/submit?url=${encodeURIComponent(generateShareUrl())}&title=${encodeURIComponent(title)}`;
    window.open(url, '_blank', 'width=550,height=450');
  };

  const shareToPinterest = () => {
    if (apodData?.media_type === 'image') {
      trackEvent('share', 'social_media', 'pinterest');
      const description = `${apodData.title} - ${apodData.explanation.substring(0, 100)}...`;
      const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(generateShareUrl())}&media=${encodeURIComponent(apodData.url || '')}&description=${encodeURIComponent(description)}`;
      window.open(url, '_blank', 'width=550,height=450');
    }
  };

  const copyShareLink = async () => {
    trackEvent('share', 'copy_link', 'clipboard');
    try {
      await navigator.clipboard.writeText(generateShareUrl());
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy manually from the address bar.');
    }
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

        {/* Cosmic Time Travel Slider */}
        <div className="mb-12 animate-slide-up">
          <Card className="bg-gradient-to-r from-[var(--space-blue)]/40 to-[var(--cosmic-purple)]/20 backdrop-blur-sm border border-[var(--cosmic-purple)]/30 rounded-2xl p-6 relative z-10">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2 text-[var(--starlight)] flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-[var(--cosmic-purple)]" />
                Cosmic Time Travel
              </h3>
              <p className="text-[var(--cosmic-gray)] text-sm">
                Journey through {timeSliderYear} • Explore NASA's archives across the years
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Slider
                  value={[timeSliderYear]}
                  onValueChange={handleTimeSliderChange}
                  onValueCommit={handleTimeSliderCommit}
                  min={1995}
                  max={new Date().getFullYear()}
                  step={1}
                  className="cosmic-slider"
                />
                
                {/* Date Preview Bubble */}
                {isDragging && previewDate && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-[var(--cosmic-purple)]/90 backdrop-blur-sm border border-[var(--stellar-blue)]/50 rounded-lg px-3 py-2 text-sm text-[var(--starlight)] font-medium shadow-lg animate-fade-in z-20">
                    <div className="text-center">
                      <div className="text-xs text-[var(--cosmic-gray)] mb-1">Preview Date</div>
                      <div>{formatDate(previewDate)}</div>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--cosmic-purple)]/90"></div>
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-[var(--cosmic-gray)] mt-2">
                  <span>1995</span>
                  <span className="text-[var(--stellar-blue)] font-medium">
                    {isDragging ? `Exploring ${timeSliderYear}` : timeSliderYear}
                  </span>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <main className="animate-slide-up">
          {apodData && (
            <Card className="bg-gradient-to-br from-[var(--space-blue)]/80 to-[var(--cosmic-purple)]/40 backdrop-blur-md border border-[var(--cosmic-purple)]/50 rounded-3xl shadow-2xl mb-8 relative z-10">
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
                {/* Debug Display */}
                {(currentDate === '2025-07-28' || (currentDate === null && apodData?.date === '2025-07-28')) && apodData && (
                  <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2">Debug Data (currentDate: {currentDate || 'null'}):</h4>
                    <pre className="text-xs text-left whitespace-pre-wrap break-all text-[var(--cosmic-gray)]">
                      {JSON.stringify(apodData, null, 2)}
                    </pre>
                  </div>
                )}
                
                {/* Media Container */}
                <div className="mb-6">
                          {apodData.url && apodData.media_type === 'video' ? (
                              apodData.url.endsWith('.mp4') ? (
                                <video 
                                  className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl border border-[var(--cosmic-purple)]/30"
                                  controls 
                                  autoPlay 
                                  muted
                                  preload="metadata"
                                  style={{ backgroundColor: '#000' }}
                                >
                                  <source src={apodData.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
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
                              )
                            ) : apodData.media_type === 'image' && apodData.url ? (
                              <img 
                                src={apodData.url}
                                alt={apodData.title}
                                className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="w-full max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-[var(--space-blue)]/40 to-[var(--cosmic-purple)]/20 border border-[var(--cosmic-purple)]/30 p-8 text-center">
                                <div className="flex items-center justify-center mb-4">
                                  <AlertTriangle className="w-8 h-8 text-[var(--stellar-blue)]" />
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--starlight)] mb-2">
                                  Special Content Entry
                                </h3>
                                <p className="text-[var(--cosmic-gray)] leading-relaxed mb-4">
                                  This entry contains special astronomical content that isn't available as a direct image or video link.
                                </p>
                                <div className="space-y-3">
                                  <Button
                                    onClick={() =>
                                      window.open(
                                        `https://apod.nasa.gov/apod/ap${apodData.date.replace(/-/g, '').slice(2)}.html`,
                                        '_blank'
                                      )
                                    }
                                    variant="outline"
                                    className="border-[var(--cosmic-purple)]/50 hover:bg-[var(--cosmic-purple)]/20 rounded-xl mr-3 text-[#000000]"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View on NASA APOD
                                  </Button>
                                  <Button
                                    onClick={handleRandomImage}
                                    variant="outline"
                                    className="border-[var(--stellar-blue)]/50 hover:bg-[var(--stellar-blue)]/20 text-[#000000] rounded-xl"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Try Different Date
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <div className="prose prose-lg prose-invert max-w-none">
                            <p className="text-[var(--cosmic-gray)] leading-relaxed text-base md:text-lg">
                              {apodData.explanation}
                            </p>
                          </div>

                          {/* Share Section */}
                          <div className="mt-6 pt-6 border-t border-[var(--cosmic-purple)]/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-[var(--cosmic-gray)]">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm">Share this cosmic wonder</span>
                              </div>
                              <Button
                                onClick={() => setIsShareDialogOpen(true)}
                                variant="outline"
                                size="sm"
                                className="border-[var(--cosmic-purple)]/50 hover:bg-[var(--cosmic-purple)]/20 text-[#030202] rounded-xl"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="text-center space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button 
                          onClick={handleTodayImage}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[var(--aurora-green)] to-[var(--stellar-blue)] hover:from-[var(--aurora-green)]/80 hover:to-[var(--stellar-blue)]/80 text-[var(--starlight)] font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--aurora-green)]/50 shadow-lg text-base"
                        >
                          <Calendar className="w-5 h-5 mr-3" />
                          Today's Cosmic Discovery
                        </Button>
                        
                        <Button 
                          onClick={handleForceRefresh}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[var(--solar-orange)] to-[var(--aurora-green)] hover:from-[var(--solar-orange)]/80 hover:to-[var(--aurora-green)]/80 text-[var(--starlight)] font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--solar-orange)]/50 shadow-lg text-base"
                        >
                          <RotateCcw className="w-5 h-5 mr-3" />
                          Force Fresh Video Data
                        </Button>
                        
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
                                  className="border border-[var(--cosmic-purple)]/50 rounded-xl text-[var(--starlight)] focus:ring-2 focus:ring-[var(--cosmic-purple)] focus:border-[var(--cosmic-purple)] placeholder:text-[var(--cosmic-gray)] bg-[#3b2975]"
                                />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <Button
                                  onClick={() => setIsDialogOpen(false)}
                                  variant="outline"
                                  className="flex-1 border-[var(--cosmic-gray)]/50 hover:bg-[var(--space-navy)] hover:text-[var(--starlight)] rounded-xl text-[#010105] bg-[#ffffff]"
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

                  {/* Social Media Sharing Dialog */}
                  <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <DialogContent className="bg-gradient-to-br from-[var(--space-dark)] to-[var(--space-navy)] backdrop-blur-sm border border-[var(--cosmic-purple)]/50 rounded-3xl text-[var(--starlight)] max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center mb-2 text-[var(--starlight)] flex items-center justify-center gap-2">
                          <Share2 className="w-5 h-5 text-[var(--cosmic-purple)]" />
                          Share This Cosmic Wonder
                        </DialogTitle>
                        <DialogDescription className="text-[var(--starlight)]/80 text-center text-sm leading-relaxed">
                          Spread the beauty of the cosmos with your friends and followers
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 p-2">
                        {apodData && (
                          <div className="bg-[var(--space-blue)]/20 rounded-2xl p-4 border border-[var(--cosmic-purple)]/30">
                            <h3 className="text-sm font-medium text-[var(--starlight)] mb-2 line-clamp-2">
                              {apodData.title}
                            </h3>
                            <p className="text-xs text-[var(--cosmic-gray)] mb-2">
                              {formatDate(apodData.date)}
                            </p>
                          </div>
                        )}

                        {/* Social Media Buttons Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={shareToTwitter}
                            className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaTwitter className="w-4 h-4" />
                            Twitter
                          </Button>
                          
                          <Button
                            onClick={shareToFacebook}
                            className="bg-[#4267B2] hover:bg-[#4267B2]/80 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaFacebook className="w-4 h-4" />
                            Facebook
                          </Button>
                          
                          <Button
                            onClick={shareToLinkedIn}
                            className="bg-[#0077B5] hover:bg-[#0077B5]/80 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaLinkedin className="w-4 h-4" />
                            LinkedIn
                          </Button>
                          
                          <Button
                            onClick={shareToReddit}
                            className="bg-[#FF4500] hover:bg-[#FF4500]/80 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaReddit className="w-4 h-4" />
                            Reddit
                          </Button>
                          
                          {apodData?.media_type === 'image' && (
                            <Button
                              onClick={shareToPinterest}
                              className="bg-[#BD081C] hover:bg-[#BD081C]/80 text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <FaPinterest className="w-4 h-4" />
                              Pinterest
                            </Button>
                          )}
                          
                          <Button
                            onClick={copyShareLink}
                            variant="outline"
                            className="border-[var(--cosmic-purple)]/50 hover:bg-[var(--cosmic-purple)]/20 text-[#000000] font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <Link className="w-4 h-4" />
                            Copy Link
                          </Button>
                        </div>

                        <div className="pt-2">
                          <Button
                            onClick={() => setIsShareDialogOpen(false)}
                            variant="outline"
                            className="w-full border-[var(--cosmic-gray)]/50 hover:bg-[var(--space-navy)] hover:text-[var(--starlight)] rounded-xl text-[var(--cosmic-gray)]"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

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