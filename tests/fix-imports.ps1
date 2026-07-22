$files = Get-ChildItem -Recurse -Filter "*.spec.ts"

foreach ($file in $files) {
    $path = $file.FullName
    $content = Get-Content -Path $path -Raw
    
    # Replace import lines
    $content = $content -replace "import \{ authenticate, clientNav, authAndNav \} from '\.\./helpers/auth'", "import { authenticate, clientNav } from '../helpers/auth'"
    $content = $content -replace "import \{ authenticate, clientNav, authAndNav \} from '\.\./\.\./helpers/auth'", "import { authenticate, clientNav } from '../../helpers/auth'"
    $content = $content -replace "import \{ authenticate, clientNav, authAndNav \} from '\./helpers/auth'", "import { authenticate, clientNav } from './helpers/auth'"
    $content = $content -replace "import \{ authenticate, clientNav \} from '\.\./helpers/auth'", "import { authenticate, clientNav } from '../helpers/auth'"
    
    # Remove duplicate blank lines
    $content = $content -replace "`r`n`r`n`r`n", "`r`n`r`n"
    
    Set-Content -Path $path -Value $content -NoNewline
}

Write-Output "Done fixing imports"
