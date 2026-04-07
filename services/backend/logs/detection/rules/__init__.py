from .brute_force import BruteForceRule
from .root_command import RootCommandRule
from .suspicious_dns import SuspiciousDNSRule
from .port_scan import PortScanRule
from .firewall_deny import FirewallDenyRule

ALL_RULES = [
    BruteForceRule(),
    RootCommandRule(),
    SuspiciousDNSRule(),
    PortScanRule(),
    FirewallDenyRule(),
]