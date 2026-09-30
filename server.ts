import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { SEED_ARTISANS, SEED_TRADES, SEED_USERS, SEED_JOBS, SEED_REVIEWS, SEED_REPORTS } from './src/data/seedData';
import { calculateDistanceKm } from './src/services/locationService';
import { verificationService } from './src/services/verificationService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory server-authoritative store initialized with seed data
  let serverArtisans = [...SEED_ARTISANS];
  let serverJobs = [...SEED_JOBS];
  let serverUsers = [...SEED_USERS];
  let serverReviews = [...SEED_REVIEWS];
  let serverReports = [...SEED_REPORTS];

  // ================= API ROUTES =================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'callOga API Server',
      timestamp: new Date().toISOString(),
      diditProvider: verificationService.getProviderName(),
      isDevMock: verificationService.isDevelopmentFallback()
    });
  });

  // Trades
  app.get('/api/trades', (req: Request, res: Response) => {
    res.json({ success: true, data: SEED_TRADES });
  });

  // Artisans: Nearby with spatial proximity PostGIS calculation
  // GET /api/artisans/nearby?latitude=6.4474&longitude=3.4842&radius=15&trade=carpenter&verified=true&availability=available_today&sort=nearest
  app.get('/api/artisans/nearby', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.latitude as string || '6.4474');
    const lng = parseFloat(req.query.longitude as string || '3.4842');
    const radius = parseFloat(req.query.radius as string || '25');
    const tradeSlug = req.query.trade as string;
    const verifiedOnly = req.query.verified === 'true';
    const availability = req.query.availability as string;
    const sort = (req.query.sort as string) || 'nearest';

    let results = serverArtisans.map((artisan) => {
      const distance = calculateDistanceKm(lat, lng, artisan.location.lat, artisan.location.lng);
      return {
        ...artisan,
        distanceKm: distance
      };
    });

    // Filter within radius
    results = results.filter((a) => a.distanceKm <= radius);

    // Filter by trade
    if (tradeSlug && tradeSlug !== 'all') {
      results = results.filter((a) => a.trade.slug === tradeSlug || a.tradeId === tradeSlug);
    }

    // Filter by verification
    if (verifiedOnly) {
      results = results.filter((a) => a.verificationStatus === 'verified');
    }

    // Filter by availability
    if (availability && availability !== 'all') {
      results = results.filter((a) => a.availabilityStatus === availability);
    }

    // Sort
    if (sort === 'nearest') {
      results.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } else if (sort === 'jobs') {
      results.sort((a, b) => b.completedJobs - a.completedJobs);
    }

    res.json({
      success: true,
      meta: {
        center: { lat, lng },
        radiusKm: radius,
        count: results.length,
        spatialEngine: 'PostGIS / Haversine Distance Engine'
      },
      data: results
    });
  });

  // Artisans: All
  app.get('/api/artisans', (req: Request, res: Response) => {
    res.json({ success: true, data: serverArtisans });
  });

  // Artisan by ID
  app.get('/api/artisans/:id', (req: Request, res: Response) => {
    const artisan = serverArtisans.find((a) => a.id === req.params.id || a.userId === req.params.id);
    if (!artisan) {
      res.status(404).json({ success: false, error: 'Artisan not found' });
      return;
    }
    res.json({ success: true, data: artisan });
  });

  // Jobs: List
  app.get('/api/jobs', (req: Request, res: Response) => {
    const customerId = req.query.customerId as string;
    const artisanId = req.query.artisanId as string;
    let list = serverJobs;
    if (customerId) list = list.filter((j) => j.customerId === customerId);
    if (artisanId) list = list.filter((j) => j.artisanId === artisanId);
    res.json({ success: true, data: list });
  });

  // Jobs: Get by ID
  app.get('/api/jobs/:id', (req: Request, res: Response) => {
    const job = serverJobs.find((j) => j.id === req.params.id || j.jobCode === req.params.id);
    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }
    res.json({ success: true, data: job });
  });

  // Jobs: Create
  app.post('/api/jobs', (req: Request, res: Response) => {
    const body = req.body;
    const artisan = serverArtisans.find((a) => a.id === body.artisanId);
    if (!artisan) {
      res.status(400).json({ success: false, error: 'Invalid artisan ID' });
      return;
    }

    const trade = SEED_TRADES.find((t) => t.id === body.tradeId) || artisan.trade;
    const customer = serverUsers.find((u) => u.id === body.customerId) || serverUsers[0];

    const newJob = {
      id: `job_${Date.now()}`,
      jobCode: `HN-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: customer.id,
      artisanId: artisan.id,
      tradeId: trade.id,
      title: body.title,
      description: body.description,
      budgetMin: body.budgetMin || 40000,
      budgetMax: body.budgetMax || 70000,
      escrowAmount: Math.round((body.budgetMin || 40000) * 0.7),
      escrowStatus: 'held_in_escrow' as const,
      releaseOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      location: {
        address: body.address || 'Victoria Island, Lagos',
        area: body.area || 'Victoria Island',
        state: 'Lagos',
        lat: 6.4281,
        lng: 3.4219
      },
      scheduledDate: body.scheduledDate || 'Tomorrow',
      status: 'pending' as const,
      images: body.images || [],
      customer,
      artisan,
      trade,
      milestones: [
        {
          id: `ms_${Date.now()}_1`,
          stepNumber: 1,
          title: 'Request Sent & Deposit Funded',
          description: `₦${Math.round((body.budgetMin || 40000) * 0.7).toLocaleString()} held in callOga Escrow`,
          timestamp: 'Just now',
          status: 'completed' as const
        },
        {
          id: `ms_${Date.now()}_2`,
          stepNumber: 2,
          title: 'Artisan Review',
          description: `${artisan.user.fullName} is reviewing your job specifications`,
          status: 'current' as const
        },
        {
          id: `ms_${Date.now()}_3`,
          stepNumber: 3,
          title: 'Artisan On the Way',
          description: 'Dispatched with professional gear',
          status: 'pending' as const
        },
        {
          id: `ms_${Date.now()}_4`,
          stepNumber: 4,
          title: 'Work Started & Inspection',
          description: 'On-site execution',
          status: 'pending' as const
        },
        {
          id: `ms_${Date.now()}_5`,
          stepNumber: 5,
          title: 'Work Completed & Review Photos',
          description: 'Artisan uploads completion evidence',
          status: 'pending' as const
        },
        {
          id: `ms_${Date.now()}_6`,
          stepNumber: 6,
          title: 'Release Payment & Review Artisan',
          description: 'Release escrow payment via secure OTP',
          status: 'pending' as const
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    serverJobs.unshift(newJob);
    res.status(201).json({ success: true, data: newJob });
  });

  // Jobs: Update Status (Accept, Decline, Complete)
  app.patch('/api/jobs/:id/status', (req: Request, res: Response) => {
    const job = serverJobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    const { status } = req.body;
    job.status = status;
    job.updatedAt = new Date().toISOString();

    if (status === 'completed') {
      job.escrowStatus = 'released';
    }

    res.json({ success: true, data: job });
  });

  // Reviews: Add review
  app.post('/api/reviews', (req: Request, res: Response) => {
    const { jobId, artisanId, rating, comment } = req.body;
    const job = serverJobs.find((j) => j.id === jobId);
    if (!job || job.status !== 'completed') {
      res.status(400).json({ success: false, error: 'Reviews only allowed for completed jobs.' });
      return;
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      jobId,
      customerId: job.customerId,
      artisanId,
      rating,
      comment,
      customerName: job.customer.fullName,
      customerArea: job.location.area,
      jobTitle: job.title,
      createdAt: new Date().toISOString()
    };

    serverReviews.unshift(newReview);
    res.status(201).json({ success: true, data: newReview });
  });

  // Identity Verification Service: Create Session
  app.post('/api/verification/create', async (req: Request, res: Response) => {
    try {
      const { artisanId, documentType } = req.body;
      const session = await verificationService.createSession(artisanId || 'art_demo', {
        documentType
      });
      res.json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Identity Verification Service: Webhook receiver
  app.post('/api/verification/webhook', async (req: Request, res: Response) => {
    try {
      const result = await verificationService.handleWebhook(req.body);
      if (result.artisanId && result.newStatus === 'verified') {
        const artisan = serverArtisans.find((a) => a.id === result.artisanId || a.userId === result.artisanId);
        if (artisan) {
          artisan.verificationStatus = 'verified';
          artisan.verificationCompletedAt = new Date().toISOString();
        }
      }
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Admin: Platform Metrics
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        totalUsers: serverUsers.length,
        totalArtisans: serverArtisans.length,
        verifiedArtisans: serverArtisans.filter((a) => a.verificationStatus === 'verified').length,
        pendingVerification: serverArtisans.filter((a) => a.verificationStatus === 'pending').length,
        activeJobs: serverJobs.filter((j) => j.status === 'in_progress').length,
        completedJobs: serverJobs.filter((j) => j.status === 'completed').length,
        totalReports: serverReports.length,
        escrowBalanceNgn: serverJobs.reduce((sum, j) => sum + (j.escrowStatus === 'held_in_escrow' ? j.escrowAmount : 0), 0)
      }
    });
  });

  // Admin: Users List
  app.get('/api/admin/users', (req: Request, res: Response) => {
    res.json({ success: true, data: serverUsers });
  });

  // Admin: Artisans List
  app.get('/api/admin/artisans', (req: Request, res: Response) => {
    res.json({ success: true, data: serverArtisans });
  });

  // Admin: Reports
  app.get('/api/admin/reports', (req: Request, res: Response) => {
    res.json({ success: true, data: serverReports });
  });

  // ================= VITE MIDDLEWARE SETUP =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[callOga] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[callOga] Server failed to start:', err);
});
