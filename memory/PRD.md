# Awadhut Banquets & Catering - PRD

## Original Problem Statement
Build a complete production-ready web application for "Awadhut Banquets & Catering" - a premium wedding/event business in Latur, Maharashtra. Website + booking system + admin control panel with Apple-style glassmorphism UI.

## Architecture
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)  
- **Database**: MongoDB (Motor async driver)
- **Auth**: JWT (admin + user roles)
- **Image Upload**: Cloudinary (ready, awaiting API keys)
- **Theme**: Red (#991B1B) + Gold (#D4AF37) + White, Glassmorphism

## User Personas
1. **Event Planners / Families** - Browse packages, book events, leave reviews
2. **Admin** - Manage packages, gallery, bookings, reviews

## Core Requirements
- [x] Dynamic packages from MongoDB (CRUD via admin)
- [x] Booking system (no login required)
- [x] User registration/login for reviews only
- [x] Admin dashboard with full CRUD
- [x] Gallery with masonry layout + category filters
- [x] SEO-optimized for Latur location
- [x] WhatsApp + Call Now floating buttons
- [x] Google Maps embed

## What's Been Implemented (Feb 2026)

### Backend (100% Pass Rate)
- Auth: User registration, login (unified for user/admin), JWT tokens
- Packages CRUD (create, read, update, delete) with category filtering
- Gallery CRUD with Cloudinary signature endpoint
- Reviews CRUD with approval system + user-linked reviews
- Bookings CRUD with status management
- Listings/Services CRUD  
- Contact form submissions
- Dashboard stats endpoint
- Seed data with 9 packages, 8 gallery items, 5 reviews, 3 listings

### Frontend (90% Pass Rate)
- 8 public pages: Home, About, Services, Packages, Gallery, Reviews, Booking, Contact
- Admin dashboard: Stats, Packages CRUD, Gallery CRUD, Bookings management, Reviews moderation, Messages
- User auth modal (login/register) for reviews
- Glassmorphism design with Playfair Display + Outfit fonts
- CSS animations (fade-in, slide, scroll-based)
- Floating WhatsApp + Call buttons
- Responsive design

## Prioritized Backlog

### P0 (Critical)
- [x] All core pages implemented
- [x] User auth for reviews
- [x] Admin CRUD operations

### P1 (Important) 
- [ ] Cloudinary API keys configuration for image upload
- [ ] SEO meta tags in HTML head
- [ ] Email notifications for bookings

### P2 (Nice to Have)
- [ ] Review photo uploads
- [ ] Event calendar view
- [ ] Multi-language support (Hindi/Marathi)
- [ ] WhatsApp Business API integration
- [ ] SMS notifications via Twilio

## Next Tasks
1. Configure Cloudinary API keys for real image uploads
2. Add SEO meta tags and structured data
3. Add email notifications for new bookings
4. Implement image optimization/lazy loading
5. Add more gallery and package items via admin
