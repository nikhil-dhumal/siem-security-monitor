from .base import BaseRule

SUSPICIOUS_DOMAINS = {
    "malicious.com",
    "evil.com",
    "badactor.net",
    "c2server.io",
    "exfil.xyz",
    "phishing.site",
}

SUSPICIOUS_TLDS = {".xyz", ".top", ".click", ".pw", ".cc"}


class SuspiciousDNSRule(BaseRule):
    rule_id = "NET_001"
    name = "Suspicious DNS Query"
    severity = "medium"

    def evaluate(self, event: dict) -> dict | None:
        if event.get("category") != "network":
            return None
        if event.get("event_type") != "dns_query":
            return None

        domain = event.get("domain", "").lower()
        if not domain:
            return None

        if domain in SUSPICIOUS_DOMAINS:
            return self.make_alert(
                event,
                description=f"DNS query to known malicious domain: {domain}",
                extra={"domain": domain, "host": event.get("host")},
            )

        for tld in SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                return self.make_alert(
                    event,
                    description=f"DNS query to suspicious TLD domain: {domain}",
                    extra={"domain": domain, "host": event.get("host")},
                )

        return None