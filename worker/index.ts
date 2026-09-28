export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return Response.json(
        { success: false, error: 'The CodePulse API has not been configured for this Worker yet.' },
        { status: 503 }
      );
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
