"""
OWASP ZAP Custom Hooks for Whoof Apps
This script provides custom authentication and context for ZAP scanning
"""

def zap_started(zap, target):
    """Hook called when ZAP starts"""
    print(f"ZAP scan started for target: {target}")
    
    # Set up custom headers for Supabase edge functions
    zap.replacer.add_rule(
        description="Add Supabase apikey header",
        enabled=True,
        matchtype="REQ_HEADER",
        matchstring="apikey",
        replacement="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGF4aGlxbmZhcGZldmRyb3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODc2NjcsImV4cCI6MjA3NzA2MzY2N30.2NFz6vswkGWSJYIsI4pqc6Y1QgpgTjxtyDT2aPcRqTs"
    )
    
    # Configure context for edge functions
    context_name = "Whoof Apps Edge Functions"
    context_id = zap.context.new_context(context_name)
    
    # Include edge function URLs
    zap.context.include_in_context(
        context_name,
        "https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1/.*"
    )
    
    # Exclude auth endpoints to avoid account lockouts
    zap.context.exclude_from_context(
        context_name,
        ".*auth.*"
    )
    
    print(f"Context '{context_name}' configured with ID: {context_id}")


def zap_pre_shutdown(zap):
    """Hook called before ZAP shuts down"""
    print("ZAP scan completed, generating final reports...")


def zap_spider_started(zap, url):
    """Hook called when spider starts"""
    print(f"Spider started for: {url}")


def zap_ajax_spider_started(zap, url):
    """Hook called when AJAX spider starts"""
    print(f"AJAX Spider started for: {url}")


def zap_active_scan_started(zap, url):
    """Hook called when active scan starts"""
    print(f"Active scan started for: {url}")
    
    # Reduce scan aggressiveness for edge functions
    zap.ascan.set_option_thread_per_host(2)
    zap.ascan.set_option_delay_in_ms(500)


def alert_found(zap, alert):
    """Hook called when an alert is found"""
    risk_levels = {
        "3": "🔴 HIGH",
        "2": "🟡 MEDIUM", 
        "1": "🔵 LOW",
        "0": "⚪ INFO"
    }
    
    risk = risk_levels.get(str(alert.get('risk', '0')), "UNKNOWN")
    name = alert.get('alert', 'Unknown Alert')
    url = alert.get('url', 'No URL')
    
    print(f"Alert found: {risk} - {name}")
    print(f"  URL: {url}")
    
    # Log high-risk alerts immediately
    if alert.get('risk') == '3':
        print(f"  ⚠️  CRITICAL VULNERABILITY DETECTED!")
        print(f"  Description: {alert.get('desc', 'No description')}")
