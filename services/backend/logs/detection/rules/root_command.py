from .base import BaseRule

HIGH_RISK_COMMANDS = {
    "cat /etc/passwd", "cat /etc/shadow", "cat /etc/sudoers",
    "whoami", "id", "passwd", "adduser", "useradd", "userdel",
    "chmod 777", "chown root", "visudo", "sudo su", "su -",
    "nc ", "ncat ", "netcat ", "curl ", "wget ",
}


class RootCommandRule(BaseRule):
    rule_id = "PROC_001"
    name = "Suspicious Root Command Execution"
    severity = "high"

    def evaluate(self, event: dict) -> dict | None:
        if event.get("category") != "process":
            return None
        if event.get("event_type") != "command_execution":
            return None
        if event.get("user") != "root":
            return None

        command = event.get("command", "")

        is_suspicious = any(
            command.startswith(c) or command == c
            for c in HIGH_RISK_COMMANDS
        )

        if is_suspicious:
            return self.make_alert(
                event,
                description=f"Suspicious command run as root: '{command}' on {event.get('host')}",
                extra={"command": command, "host": event.get("host")},
            )

        return None