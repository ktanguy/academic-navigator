
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-lg font-semibold text-foreground">
                UniCenter
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              AI-Powered Integrated Academic Support Platform for universities and institutions.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/directory" className="text-muted-foreground transition-colors hover:text-foreground">
                  Staff Directory
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-muted-foreground transition-colors hover:text-foreground">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/helpdesk" className="text-muted-foreground transition-colors hover:text-foreground">
                  Help Desk
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Academic Navigator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
