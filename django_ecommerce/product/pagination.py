from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class HDevPageNumberPagination(PageNumberPagination):
    page_size = 4
    page_query_param = "pagina"
    page_size_query_param = "tamano"
    max_page_size = 10

    def get_paginated_response(self, data):
        return Response({
            "total": self.page.paginator.count,
            "pagina_actual": self.page.number,
            "total_paginas": self.page.paginator.num_pages,
            "siguiente": self.get_next_link(),
            "anterior": self.get_previous_link(),
            "resultados": data,
        })
