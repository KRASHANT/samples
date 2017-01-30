[CmdletBinding()]
Param (
    [Parameter(Mandatory=$True, HelpMessage="The site collection relative URL of the site assets library (without the starting /)")]
    [string]$SiteAssetsUrl,

    [Parameter(Mandatory=$False)]
    [int]$ListBaseTemplate=101,

    [Parameter(Mandatory=$False)]
    [string]$JsFileName
)

# Default values
$defaultJsFileName = "openInNewTab.js"
$defaultScriptLinkName = "SLOpenInNewTab"
$defaultCustomActionName = "OpenInNewTabCustomAction"
$defaultCustomActionTitle = "Open in a new Tab"
$defaultCustomActionDescription = "Allows to open a document in a new tab"

# Create the context if not already existing
Try
{
    Get-PnPContext
}
Catch
{
    Write-Host "Please connect to SharePoint"
    Connect-PnPOnline
}

If (!$JsFileName) {
    $JsFileName = $defaultJsFileName
}

# Write the needed JavaScript in a local file
$js = "var YPCode = YPCode || {}; YPCode.Utils = YPCode.Utils || {}; YPCode.Utils.openInNewTab = function (url) { var win = window.open(url, '_blank'); if (win) win.focus(); };"
$js | Out-File $JsFileName

# Get the web URL
$siteCollUrl = (Get-PnPSite).Url

# Upload the JS file
Try
{
    $provisionnedFile = Add-PnPFile -Path $JsFileName -Folder $SiteAssetsUrl
}
Catch
{
    Write-Host The JavaScript file $JsFileName cannot be provisionned to $SiteAssetsUrl
    Return
}

Try
{
    # Add the script link custom action
    $jsFileUrl = $siteCollUrl + "/" + $SiteAssetsUrl + "/" + $JsFileName
    $result = Add-PnPJavaScriptLink -Name $defaultScriptLinkName -Scope Site -Url $jsFileUrl
    # Add the custom action
    $result = Add-PnPCustomAction -Name $defaultCustomActionName -Title $defaultCustomActionTitle -Description $defaultCustomActionDescription -RegistrationId $ListBaseTemplate -RegistrationType "List" -Group "SiteActions" -Location "EditControlBlock"  -Url "javascript:YPCode.Utils.openInNewTab('{ItemUrl}');" -Scope Site
}
Catch
{
    Write-Host The custom actions cannot be added to the target site
}