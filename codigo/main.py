def seguro(tabuleiro, linha, coluna, n):
    for c in range(coluna):
        if tabuleiro[linha][c] == 1:
            return False

    r, c = linha - 1, coluna - 1
    while r >= 0 and c >= 0:
        if tabuleiro[r][c] == 1:
            return False
        r -= 1
        c -= 1

    r, c = linha + 1, coluna - 1
    while r < n and c >= 0:
        if tabuleiro[r][c] == 1:
            return False
        r += 1
        c -= 1

    return True


def resolver_util(tabuleiro, coluna, n, solucoes):
    if coluna == n:
        sol = []
        for r in range(n):
            linha = ""
            for c in range(n):
                linha += "R " if tabuleiro[r][c] == 1 else ". "
            sol.append(linha)
        solucoes.append(sol)
        return

    for linha in range(n):
        if seguro(tabuleiro, linha, coluna, n):
            tabuleiro[linha][coluna] = 1
            resolver_util(tabuleiro, coluna + 1, n, solucoes)
            tabuleiro[linha][coluna] = 0


def resolver_n_rainhas(n):
    tabuleiro = [[0] * n for _ in range(n)]
    solucoes = []
    resolver_util(tabuleiro, 0, n, solucoes)
    return solucoes




if __name__ == "__main__":
    n = 4
    solucoes = resolver_n_rainhas(n)

    print(f"Soluções para N = {n}:\n")

    for idx, sol in enumerate(solucoes, 1):
        print(f"Solução {idx}:")
        for linha in sol:
            print(linha)
        print()
