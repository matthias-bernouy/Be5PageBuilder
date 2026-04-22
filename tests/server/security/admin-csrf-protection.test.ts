import { describe, test, expect } from "bun:test";
import { createAuthGuard } from "src/control/endpoints/registerEndpoints";

// If the admin auth relies on cookies (via @bernouy/socle), POST routes under
// /cms/api/* are CSRF-vulnerable unless the guard checks Origin /
// Referer or a fetch-only header like X-Requested-With. This test asserts SOME
// form of CSRF mitigation runs for mutating methods on the admin prefix.
describe("admin CSRF protection", () => {
    test("mutating request without matching Origin must be rejected", async () => {
        const system: any = {
            auth: {
                guardAuthenticated: async () => ({ role: "admin" }),
                loginPage: "/login",
                withRedirect: (p: string) => p,
            },
        };
        const guard = createAuthGuard(system);

        let nextCalled = false;
        const next = async () => { nextCalled = true; return new Response("ok"); };

        // Cross-origin POST (attacker.com) with valid session should not reach `next`.
        const req = new Request("http://site.com/cms/api/page", {
            method: "POST",
            headers: { "Origin": "http://attacker.com" },
        });
        await guard(req, next);
        expect(nextCalled).toBe(false);
    });
});
