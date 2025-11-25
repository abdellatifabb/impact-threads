import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Camera, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-child.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">Family Stories</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="#mission" className="text-foreground/70 hover:text-foreground transition">Our Mission</Link>
              <Link to="#how" className="text-foreground/70 hover:text-foreground transition">How It Works</Link>
              <Link to="#about" className="text-foreground/70 hover:text-foreground transition">About Us</Link>
              <Link to="/auth/login">
                <Button variant="ghost">Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <h1 className="font-serif text-5xl md:text-6xl leading-tight">
                Turn Your Support Into a Real Child's Story
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect directly with the families and children you're helping. See their milestones, share in their joys, and witness the real impact of your generosity through personal updates and photos.
              </p>
              <div className="flex gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="rounded-full shadow-warm">
                    Join The Movement
                  </Button>
                </Link>
                <Link to="#how">
                  <Button size="lg" variant="outline" className="rounded-full">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-warm">
                <img 
                  src={heroImage} 
                  alt="A smiling child representing hope and the impact of support" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-16 md:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building real connections between donors and families through transparency and storytelling
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Become a Donor</h3>
              <p className="text-muted-foreground">
                Sign up and choose to sponsor one or more vulnerable families in need
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Get Matched</h3>
              <p className="text-muted-foreground">
                We carefully match you with families whose stories will touch your heart
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Receive Updates</h3>
              <p className="text-muted-foreground">
                Get personal updates with photos and stories about the children you're helping
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Stay Connected</h3>
              <p className="text-muted-foreground">
                Send messages, request updates, and build a meaningful relationship
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="mission" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-warm">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl">Transparency Builds Trust</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We believe donors deserve to see the real impact of their generosity. That's why we've built a platform that connects you directly with the families you support - no intermediaries, no barriers, just authentic human stories.
              </p>
              <p className="text-lg text-muted-foreground">
                Every photo, every update, every milestone shared brings you closer to understanding the beautiful difference you're making in a child's life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-4xl md:text-5xl">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90">
            Join our community of compassionate donors and become part of a family's journey to a brighter future.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" variant="secondary" className="rounded-full shadow-lg">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg">Family Stories</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 Family Stories. Building bridges of hope.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
